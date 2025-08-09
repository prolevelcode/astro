import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from 'ws';
import { storage } from "./storage";
import { auditEngine } from './services/audit-engine';
import { environmentManager } from './services/environment-manager';
import { apiTester } from './services/api-tester';
import { insertEnvironmentVarSchema, insertDetectedIssueSchema } from '@shared/schema';

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates on separate path
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/api/ws'
  });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(data));
      }
    });
  };

  // Dashboard summary
  app.get('/api/dashboard/summary', async (req, res) => {
    try {
      const [auditRuns, envVars, apiConnections, issues] = await Promise.all([
        storage.getAllAuditRuns(),
        storage.getAllEnvironmentVars(),
        storage.getAllApiConnections(),
        storage.getAllDetectedIssues(),
      ]);

      const latestRun = auditRuns[0];
      const steps = latestRun ? await storage.getAuditStepsByRunId(latestRun.id) : [];

      const summary = {
        dependencies: {
          installed: steps.find(s => s.stepName === 'Install Dependencies')?.status === 'success' ? 23 : 0,
          total: 25,
          percentage: steps.find(s => s.stepName === 'Install Dependencies')?.status === 'success' ? 92 : 0,
        },
        formInputs: {
          working: 7,
          total: 8,
          percentage: 87,
        },
        apiConnections: {
          connected: apiConnections.filter(api => api.status === 'connected').length,
          total: apiConnections.length,
          percentage: Math.round((apiConnections.filter(api => api.status === 'connected').length / apiConnections.length) * 100),
        },
        buildStatus: latestRun?.status === 'completed' ? 'Ready' : 'Pending',
        lastAuditRun: latestRun,
        totalIssues: issues.length,
        criticalIssues: issues.filter(i => i.severity === 'critical').length,
      };

      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get dashboard summary' });
    }
  });

  // Audit management
  app.post('/api/audit/start', async (req, res) => {
    try {
      const auditRunId = await auditEngine.startFullAudit();
      broadcast({ type: 'audit_started', auditRunId });
      res.json({ auditRunId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start audit' });
    }
  });

  app.get('/api/audit/runs', async (req, res) => {
    try {
      const runs = await storage.getAllAuditRuns();
      res.json(runs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get audit runs' });
    }
  });

  app.get('/api/audit/runs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const run = await storage.getAuditRun(id);
      if (!run) {
        return res.status(404).json({ error: 'Audit run not found' });
      }

      const steps = await storage.getAuditStepsByRunId(id);
      const issues = await storage.getDetectedIssuesByRunId(id);

      res.json({ run, steps, issues });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get audit run details' });
    }
  });

  app.get('/api/audit/runs/:id/progress', async (req, res) => {
    try {
      const { id } = req.params;
      const progress = await auditEngine.getAuditProgress(id);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get audit progress' });
    }
  });

  // Environment variable management
  app.get('/api/environment/vars', async (req, res) => {
    try {
      const vars = await environmentManager.getAllEnvironmentVariables();
      res.json(vars);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get environment variables' });
    }
  });

  app.post('/api/environment/vars', async (req, res) => {
    try {
      const data = insertEnvironmentVarSchema.parse(req.body);
      const envVar = await environmentManager.saveEnvironmentVariable(
        data.key, 
        data.value, 
        data.service || undefined
      );
      res.json(envVar);
    } catch (error) {
      res.status(400).json({ error: 'Invalid environment variable data' });
    }
  });

  app.put('/api/environment/vars/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = await environmentManager.updateEnvironmentVariable(id, updates);
      if (!updated) {
        return res.status(404).json({ error: 'Environment variable not found' });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update environment variable' });
    }
  });

  app.delete('/api/environment/vars/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await environmentManager.deleteEnvironmentVariable(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete environment variable' });
    }
  });

  app.get('/api/environment/services/:service/validate', async (req, res) => {
    try {
      const { service } = req.params;
      const validation = await environmentManager.validateServiceConfiguration(service);
      res.json(validation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to validate service configuration' });
    }
  });

  app.post('/api/environment/create-example', async (req, res) => {
    try {
      const success = await environmentManager.createExampleEnvFile();
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create example environment file' });
    }
  });

  // API testing
  app.get('/api/connections', async (req, res) => {
    try {
      const connections = await storage.getAllApiConnections();
      res.json(connections);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get API connections' });
    }
  });

  app.post('/api/connections/test-all', async (req, res) => {
    try {
      const results = await apiTester.testAllConnections();
      broadcast({ type: 'connections_tested', results });
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to test connections' });
    }
  });

  app.post('/api/connections/:service/test', async (req, res) => {
    try {
      const { service } = req.params;
      const result = await apiTester.testConnection(service);
      broadcast({ type: 'connection_tested', result });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to test connection' });
    }
  });

  app.post('/api/payment/simulate', async (req, res) => {
    try {
      const { amount = 100 } = req.body;
      const result = await apiTester.simulatePaymentFlow(amount);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to simulate payment flow' });
    }
  });

  app.post('/api/affiliate/test', async (req, res) => {
    try {
      const testData = req.body;
      const result = await apiTester.testAffiliateTracking(testData);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to test affiliate tracking' });
    }
  });

  // Issues management
  app.get('/api/issues', async (req, res) => {
    try {
      const { auditRunId } = req.query;
      const issues = auditRunId 
        ? await storage.getDetectedIssuesByRunId(auditRunId as string)
        : await storage.getAllDetectedIssues();
      res.json(issues);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get issues' });
    }
  });

  app.post('/api/issues', async (req, res) => {
    try {
      const data = insertDetectedIssueSchema.parse(req.body);
      const issue = await storage.createDetectedIssue(data);
      broadcast({ type: 'issue_detected', issue });
      res.json(issue);
    } catch (error) {
      res.status(400).json({ error: 'Invalid issue data' });
    }
  });

  app.put('/api/issues/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = await storage.updateDetectedIssue(id, updates);
      if (!updated) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update issue' });
    }
  });

  return httpServer;
}
