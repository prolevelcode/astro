import { apiRequest as baseApiRequest } from "./queryClient";

export const apiRequest = baseApiRequest;

// Additional API utility functions specific to the audit system
export async function startAuditRun(): Promise<{ auditRunId: string }> {
  const response = await apiRequest('POST', '/api/audit/start');
  return response.json();
}

export async function getAuditProgress(auditRunId: string) {
  const response = await apiRequest('GET', `/api/audit/runs/${auditRunId}/progress`);
  return response.json();
}

export async function testApiConnection(service: string) {
  const response = await apiRequest('POST', `/api/connections/${service}/test`);
  return response.json();
}

export async function testAllApiConnections() {
  const response = await apiRequest('POST', '/api/connections/test-all');
  return response.json();
}

export async function createEnvironmentVar(data: { key: string; value: string; service?: string }) {
  const response = await apiRequest('POST', '/api/environment/vars', data);
  return response.json();
}

export async function simulatePaymentFlow(amount: number = 100) {
  const response = await apiRequest('POST', '/api/payment/simulate', { amount });
  return response.json();
}

export async function testAffiliateTracking(data?: { referralCode?: string; userId?: string }) {
  const response = await apiRequest('POST', '/api/affiliate/test', data || {});
  return response.json();
}
