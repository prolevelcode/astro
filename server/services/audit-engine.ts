import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { storage } from '../storage';
import type { InsertAuditStep, InsertDetectedIssue } from '@shared/schema';

export class AuditEngine {
  private currentAuditRunId: string | null = null;

  async startFullAudit(): Promise<string> {
    const auditRun = await storage.createAuditRun({
      status: 'running',
      results: null,
      logs: [],
    });

    this.currentAuditRunId = auditRun.id;

    // Create audit steps
    const steps = [
      { stepName: 'Install Dependencies', stepOrder: '1' },
      { stepName: 'Local Dev Server Test', stepOrder: '2' },
      { stepName: 'Lint Code', stepOrder: '3' },
      { stepName: 'Search Blocked Inputs', stepOrder: '4' },
      { stepName: 'Production Simulation', stepOrder: '5' },
      { stepName: 'Console & Network Errors', stepOrder: '6' },
    ];

    for (const step of steps) {
      await storage.createAuditStep({
        auditRunId: auditRun.id,
        ...step,
        status: 'pending',
        output: null,
        errorMessage: null,
      });
    }

    // Execute steps sequentially
    this.executeAuditSteps(auditRun.id);

    return auditRun.id;
  }

  private async executeAuditSteps(auditRunId: string) {
    try {
      const steps = await storage.getAuditStepsByRunId(auditRunId);
      
      for (const step of steps) {
        await this.executeStep(step.id, step.stepName);
      }

      await storage.updateAuditRun(auditRunId, {
        status: 'completed',
        completedAt: new Date(),
      });
    } catch (error) {
      await storage.updateAuditRun(auditRunId, {
        status: 'failed',
        completedAt: new Date(),
      });
    }
  }

  private async executeStep(stepId: string, stepName: string) {
    await storage.updateAuditStep(stepId, {
      status: 'running',
      startedAt: new Date(),
    });

    try {
      let result: { output: string; success: boolean };

      switch (stepName) {
        case 'Install Dependencies':
          result = await this.runNpmInstall();
          break;
        case 'Local Dev Server Test':
          result = await this.testDevServer();
          break;
        case 'Lint Code':
          result = await this.runLint();
          break;
        case 'Search Blocked Inputs':
          result = await this.searchBlockedInputs();
          break;
        case 'Production Simulation':
          result = await this.testProduction();
          break;
        case 'Console & Network Errors':
          result = await this.checkConsoleErrors();
          break;
        default:
          result = { output: 'Unknown step', success: false };
      }

      await storage.updateAuditStep(stepId, {
        status: result.success ? 'success' : 'failed',
        output: result.output,
        errorMessage: result.success ? null : result.output,
        completedAt: new Date(),
      });

    } catch (error) {
      await storage.updateAuditStep(stepId, {
        status: 'failed',
        output: null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      });
    }
  }

  private async runCommand(command: string, args: string[] = []): Promise<{ output: string; success: boolean }> {
    return new Promise((resolve) => {
      const process = spawn(command, args, { 
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true 
      });
      
      let output = '';
      let error = '';

      process.stdout?.on('data', (data) => {
        output += data.toString();
      });

      process.stderr?.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        const success = code === 0;
        resolve({
          output: success ? output : error,
          success
        });
      });

      // Timeout after 60 seconds
      setTimeout(() => {
        process.kill();
        resolve({
          output: 'Command timed out after 60 seconds',
          success: false
        });
      }, 60000);
    });
  }

  private async runNpmInstall(): Promise<{ output: string; success: boolean }> {
    return this.runCommand('npm', ['install']);
  }

  private async testDevServer(): Promise<{ output: string; success: boolean }> {
    // Start dev server briefly to check if it runs
    const devResult = await this.runCommand('timeout', ['10s', 'npm', 'run', 'dev']);
    
    // Check if form inputs are accessible by scanning React components
    const formCheck = await this.scanForFormIssues();
    
    return {
      output: `Dev server test: ${devResult.output}\nForm scan: ${formCheck.output}`,
      success: devResult.success && formCheck.success
    };
  }

  private async runLint(): Promise<{ output: string; success: boolean }> {
    // Since there's no explicit lint script, we'll use tsc to check types
    return this.runCommand('npx', ['tsc', '--noEmit']);
  }

  private async searchBlockedInputs(): Promise<{ output: string; success: boolean }> {
    try {
      const blockedInputs: string[] = [];
      
      // Search for readonly attributes
      const readonlyResult = await this.runCommand('grep', ['-r', '-n', 'readonly', '.', '--include=*.tsx', '--include=*.jsx']);
      if (readonlyResult.output) {
        blockedInputs.push(`Readonly attributes found:\n${readonlyResult.output}`);
      }

      // Search for disabled attributes
      const disabledResult = await this.runCommand('grep', ['-r', '-n', 'disabled', '.', '--include=*.tsx', '--include=*.jsx']);
      if (disabledResult.output) {
        blockedInputs.push(`Disabled attributes found:\n${disabledResult.output}`);
      }

      const output = blockedInputs.length > 0 ? blockedInputs.join('\n\n') : 'No blocked inputs found';
      
      // Create issues for found problems
      if (this.currentAuditRunId && blockedInputs.length > 0) {
        await this.createIssuesFromBlockedInputs(blockedInputs);
      }

      return {
        output,
        success: true
      };
    } catch (error) {
      return {
        output: error instanceof Error ? error.message : 'Error searching for blocked inputs',
        success: false
      };
    }
  }

  private async testProduction(): Promise<{ output: string; success: boolean }> {
    // Build the project
    const buildResult = await this.runCommand('npm', ['run', 'build']);
    if (!buildResult.success) {
      return buildResult;
    }

    // Test production build briefly
    const prodResult = await this.runCommand('timeout', ['10s', 'npm', 'start']);
    
    return {
      output: `Build: ${buildResult.output}\nProduction test: ${prodResult.output}`,
      success: buildResult.success && prodResult.success
    };
  }

  private async checkConsoleErrors(): Promise<{ output: string; success: boolean }> {
    // This would typically require browser automation
    // For now, we'll simulate by checking common error patterns in logs
    try {
      const logFiles = ['server/logs/', 'client/logs/'];
      let errors: string[] = [];

      for (const logPath of logFiles) {
        try {
          const files = await fs.readdir(logPath).catch(() => []);
          for (const file of files) {
            if (file.endsWith('.log')) {
              const content = await fs.readFile(join(logPath, file), 'utf-8');
              const errorLines = content.split('\n').filter(line => 
                line.toLowerCase().includes('error') || 
                line.toLowerCase().includes('failed')
              );
              errors.push(...errorLines);
            }
          }
        } catch {
          // Directory doesn't exist, skip
        }
      }

      return {
        output: errors.length > 0 ? errors.join('\n') : 'No console errors detected in log files',
        success: errors.length === 0
      };
    } catch (error) {
      return {
        output: error instanceof Error ? error.message : 'Error checking console logs',
        success: false
      };
    }
  }

  private async scanForFormIssues(): Promise<{ output: string; success: boolean }> {
    try {
      const issues: string[] = [];
      const clientPath = './client/src';
      
      const scanDirectory = async (dirPath: string) => {
        try {
          const files = await fs.readdir(dirPath);
          for (const file of files) {
            const fullPath = join(dirPath, file);
            const stat = await fs.stat(fullPath);
            
            if (stat.isDirectory()) {
              await scanDirectory(fullPath);
            } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
              const content = await fs.readFile(fullPath, 'utf-8');
              
              // Check for common form issues
              if (content.includes('disabled={true}') || content.includes('disabled=true')) {
                issues.push(`${fullPath}: Form input explicitly disabled`);
              }
              if (content.includes('readOnly={true}') || content.includes('readOnly=true')) {
                issues.push(`${fullPath}: Form input set to read-only`);
              }
            }
          }
        } catch (error) {
          // Ignore errors accessing files
        }
      };

      await scanDirectory(clientPath);

      return {
        output: issues.length > 0 ? issues.join('\n') : 'No form issues detected',
        success: issues.length === 0
      };
    } catch (error) {
      return {
        output: error instanceof Error ? error.message : 'Error scanning for form issues',
        success: false
      };
    }
  }

  private async createIssuesFromBlockedInputs(blockedInputs: string[]) {
    if (!this.currentAuditRunId) return;

    for (const input of blockedInputs) {
      const lines = input.split('\n');
      for (const line of lines) {
        if (line.includes(':')) {
          const [filePath, ...rest] = line.split(':');
          await storage.createDetectedIssue({
            auditRunId: this.currentAuditRunId,
            type: 'form_input',
            severity: 'critical',
            title: 'Form Input Blocked',
            description: rest.join(':'),
            filePath: filePath,
            recommendation: 'Remove disabled or readonly attributes from form inputs',
            isResolved: false,
          });
        }
      }
    }
  }

  async getAuditProgress(auditRunId: string) {
    const steps = await storage.getAuditStepsByRunId(auditRunId);
    const completed = steps.filter(s => s.status === 'success' || s.status === 'failed').length;
    const total = steps.length;
    
    return {
      steps,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      isComplete: completed === total
    };
  }
}

export const auditEngine = new AuditEngine();
