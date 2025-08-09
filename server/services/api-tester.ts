import { storage } from '../storage';

export class ApiTester {
  async testAllConnections() {
    const connections = await storage.getAllApiConnections();
    const results = [];

    for (const connection of connections) {
      const result = await this.testConnection(connection.service);
      results.push(result);
    }

    return results;
  }

  async testConnection(service: string) {
    const startTime = Date.now();
    let status: 'connected' | 'disconnected' | 'error' = 'disconnected';
    let errorMessage: string | null = null;
    let responseTime: string | null = null;

    try {
      const result = await this.performServiceTest(service);
      status = result.success ? 'connected' : 'error';
      errorMessage = result.error || null;
      responseTime = `${Date.now() - startTime}ms`;
    } catch (error) {
      status = 'error';
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      responseTime = `${Date.now() - startTime}ms`;
    }

    // Update connection status
    await storage.createOrUpdateApiConnection({
      service,
      status,
      errorMessage,
      responseTime,
    });

    return {
      service,
      status,
      errorMessage,
      responseTime,
    };
  }

  private async performServiceTest(service: string): Promise<{ success: boolean; error?: string }> {
    const envVars = await storage.getEnvironmentVarsByService(service);
    const envMap = envVars.reduce((acc, env) => {
      acc[env.key] = env.value;
      return acc;
    }, {} as Record<string, string>);

    switch (service) {
      case 'prokerala':
        return this.testProkeralaConnection(envMap);
      case 'razorpay':
        return this.testRazorpayConnection(envMap);
      case 'goaffpro':
        return this.testGoAffProConnection(envMap);
      default:
        return { success: false, error: 'Unknown service' };
    }
  }

  private async testProkeralaConnection(env: Record<string, string>): Promise<{ success: boolean; error?: string }> {
    const apiKey = env.PROKERALA_API_KEY;
    const userId = env.PROKERALA_USER_ID;

    if (!apiKey || !userId) {
      return { success: false, error: 'Missing PROKERALA_API_KEY or PROKERALA_USER_ID' };
    }

    try {
      // Test with a simple API call to validate credentials
      const response = await fetch('https://api.prokerala.com/v2/astrology/kundli', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok || response.status === 422) { // 422 is expected for missing params, but auth is ok
        return { success: true };
      } else if (response.status === 401) {
        return { success: false, error: 'Invalid API credentials' };
      } else {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      return { success: false, error: `Network error: ${error instanceof Error ? error.message : 'Unknown'}` };
    }
  }

  private async testRazorpayConnection(env: Record<string, string>): Promise<{ success: boolean; error?: string }> {
    const keyId = env.RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return { success: false, error: 'Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET' };
    }

    try {
      // Test with payments endpoint
      const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/payments', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return { success: true };
      } else if (response.status === 401) {
        return { success: false, error: 'Invalid Razorpay credentials' };
      } else {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      return { success: false, error: `Network error: ${error instanceof Error ? error.message : 'Unknown'}` };
    }
  }

  private async testGoAffProConnection(env: Record<string, string>): Promise<{ success: boolean; error?: string }> {
    const apiKey = env.GOAFFPRO_API_KEY;
    const storeId = env.GOAFFPRO_STORE_ID;

    if (!apiKey || !storeId) {
      return { success: false, error: 'Missing GOAFFPRO_API_KEY or GOAFFPRO_STORE_ID' };
    }

    try {
      // Test with affiliates endpoint
      const response = await fetch(`https://api.goaffpro.com/affiliates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return { success: true };
      } else if (response.status === 401) {
        return { success: false, error: 'Invalid GoAffPro API key' };
      } else {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      return { success: false, error: `Network error: ${error instanceof Error ? error.message : 'Unknown'}` };
    }
  }

  async simulatePaymentFlow(amount: number = 100) {
    // Get Razorpay credentials
    const razorpayVars = await storage.getEnvironmentVarsByService('razorpay');
    const envMap = razorpayVars.reduce((acc, env) => {
      acc[env.key] = env.value;
      return acc;
    }, {} as Record<string, string>);

    const keyId = envMap.RAZORPAY_KEY_ID;
    const keySecret = envMap.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return { success: false, error: 'Razorpay credentials not configured' };
    }

    try {
      // Create a test order
      const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects amount in paise
          currency: 'INR',
          receipt: `test_receipt_${Date.now()}`,
          notes: { test: 'Audit payment flow test' }
        }),
      });

      if (response.ok) {
        const order = await response.json();
        return { 
          success: true, 
          orderId: order.id, 
          amount: order.amount / 100,
          currency: order.currency
        };
      } else {
        const error = await response.text();
        return { success: false, error: `Failed to create order: ${error}` };
      }
    } catch (error) {
      return { success: false, error: `Payment flow test failed: ${error instanceof Error ? error.message : 'Unknown'}` };
    }
  }

  async testAffiliateTracking(testData: { referralCode?: string; userId?: string } = {}) {
    const goaffproVars = await storage.getEnvironmentVarsByService('goaffpro');
    const envMap = goaffproVars.reduce((acc, env) => {
      acc[env.key] = env.value;
      return acc;
    }, {} as Record<string, string>);

    const apiKey = envMap.GOAFFPRO_API_KEY;

    if (!apiKey) {
      return { success: false, error: 'GoAffPro API key not configured' };
    }

    try {
      // Test affiliate tracking with a sample referral
      const response = await fetch('https://api.goaffpro.com/track', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referral_code: testData.referralCode || 'TEST123',
          user_id: testData.userId || 'test_user_' + Date.now(),
          event: 'page_view',
          url: 'https://astromarket.example.com/test',
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, trackingId: result.tracking_id };
      } else {
        const error = await response.text();
        return { success: false, error: `Affiliate tracking failed: ${error}` };
      }
    } catch (error) {
      return { success: false, error: `Affiliate tracking test failed: ${error instanceof Error ? error.message : 'Unknown'}` };
    }
  }
}

export const apiTester = new ApiTester();
