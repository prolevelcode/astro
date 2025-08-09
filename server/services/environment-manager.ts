import { promises as fs } from 'fs';
import { join } from 'path';
import { storage } from '../storage';

export class EnvironmentManager {
  private envPath = '.env';
  private envExamplePath = '.env.example';

  async loadEnvironmentVariables() {
    try {
      // Load from .env file
      const envContent = await fs.readFile(this.envPath, 'utf-8').catch(() => '');
      const envVars = this.parseEnvContent(envContent);

      // Store in database
      for (const [key, value] of Object.entries(envVars)) {
        const service = this.detectService(key);
        await storage.createEnvironmentVar({
          key,
          value,
          service,
          isActive: true,
        }).catch(() => {
          // Variable might already exist, that's ok
        });
      }

      return envVars;
    } catch (error) {
      throw new Error(`Failed to load environment variables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveEnvironmentVariable(key: string, value: string, service?: string) {
    // Save to database
    const envVar = await storage.createEnvironmentVar({
      key,
      value,
      service,
      isActive: true,
    });

    // Update .env file
    await this.updateEnvFile(key, value);

    return envVar;
  }

  async updateEnvironmentVariable(id: string, updates: { key?: string; value?: string; service?: string; isActive?: boolean }) {
    const updated = await storage.updateEnvironmentVar(id, updates);
    
    if (updated && updates.value !== undefined) {
      await this.updateEnvFile(updated.key, updates.value);
    }

    return updated;
  }

  async deleteEnvironmentVariable(id: string) {
    const envVar = await storage.getAllEnvironmentVars();
    const target = envVar.find(v => v.id === id);
    
    if (target) {
      await storage.deleteEnvironmentVar(id);
      await this.removeFromEnvFile(target.key);
    }

    return true;
  }

  async getAllEnvironmentVariables() {
    return storage.getAllEnvironmentVars();
  }

  async getEnvironmentVariablesByService(service: string) {
    return storage.getEnvironmentVarsByService(service);
  }

  async validateServiceConfiguration(service: string): Promise<{ valid: boolean; missingVars: string[] }> {
    const requiredVars = this.getRequiredVarsForService(service);
    const existingVars = await this.getEnvironmentVariablesByService(service);
    const existingKeys = existingVars.map(v => v.key);

    const missingVars = requiredVars.filter(varName => !existingKeys.includes(varName));

    return {
      valid: missingVars.length === 0,
      missingVars
    };
  }

  private parseEnvContent(content: string): Record<string, string> {
    const vars: Record<string, string> = {};
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
        vars[key.trim()] = value;
      }
    }

    return vars;
  }

  private detectService(key: string): string | undefined {
    const keyLower = key.toLowerCase();
    
    if (keyLower.includes('prokerala')) return 'prokerala';
    if (keyLower.includes('razorpay')) return 'razorpay';
    if (keyLower.includes('goaffpro') || keyLower.includes('affiliate')) return 'goaffpro';
    
    return undefined;
  }

  private getRequiredVarsForService(service: string): string[] {
    switch (service) {
      case 'prokerala':
        return ['PROKERALA_API_KEY', 'PROKERALA_USER_ID'];
      case 'razorpay':
        return ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
      case 'goaffpro':
        return ['GOAFFPRO_API_KEY', 'GOAFFPRO_STORE_ID'];
      default:
        return [];
    }
  }

  private async updateEnvFile(key: string, value: string) {
    try {
      let envContent = '';
      try {
        envContent = await fs.readFile(this.envPath, 'utf-8');
      } catch {
        // File doesn't exist, create new
      }

      const lines = envContent.split('\n');
      let updated = false;

      // Update existing key or add new one
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(`${key}=`)) {
          lines[i] = `${key}=${value}`;
          updated = true;
          break;
        }
      }

      if (!updated) {
        lines.push(`${key}=${value}`);
      }

      await fs.writeFile(this.envPath, lines.join('\n'));
    } catch (error) {
      console.error('Failed to update .env file:', error);
    }
  }

  private async removeFromEnvFile(key: string) {
    try {
      const envContent = await fs.readFile(this.envPath, 'utf-8');
      const lines = envContent.split('\n').filter(line => !line.startsWith(`${key}=`));
      await fs.writeFile(this.envPath, lines.join('\n'));
    } catch (error) {
      console.error('Failed to remove from .env file:', error);
    }
  }

  async createExampleEnvFile() {
    const exampleContent = `# Prokerala API Configuration
PROKERALA_API_KEY=your_prokerala_api_key_here
PROKERALA_USER_ID=your_prokerala_user_id_here

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# GoAffPro Affiliate Configuration
GOAFFPRO_API_KEY=your_goaffpro_api_key_here
GOAFFPRO_STORE_ID=your_goaffpro_store_id_here

# Application Configuration
NODE_ENV=development
PORT=5000
`;

    try {
      await fs.writeFile(this.envExamplePath, exampleContent);
      return true;
    } catch (error) {
      console.error('Failed to create .env.example file:', error);
      return false;
    }
  }
}

export const environmentManager = new EnvironmentManager();
