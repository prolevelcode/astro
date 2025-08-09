import { type AuditRun, type InsertAuditRun, type EnvironmentVar, type InsertEnvironmentVar, type AuditStep, type InsertAuditStep, type ApiConnection, type InsertApiConnection, type DetectedIssue, type InsertDetectedIssue } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Audit Runs
  createAuditRun(auditRun: InsertAuditRun): Promise<AuditRun>;
  getAuditRun(id: string): Promise<AuditRun | undefined>;
  getAllAuditRuns(): Promise<AuditRun[]>;
  updateAuditRun(id: string, updates: Partial<AuditRun>): Promise<AuditRun | undefined>;

  // Environment Variables
  createEnvironmentVar(envVar: InsertEnvironmentVar): Promise<EnvironmentVar>;
  getAllEnvironmentVars(): Promise<EnvironmentVar[]>;
  getEnvironmentVarsByService(service: string): Promise<EnvironmentVar[]>;
  updateEnvironmentVar(id: string, updates: Partial<EnvironmentVar>): Promise<EnvironmentVar | undefined>;
  deleteEnvironmentVar(id: string): Promise<boolean>;

  // Audit Steps
  createAuditStep(step: InsertAuditStep): Promise<AuditStep>;
  getAuditStepsByRunId(auditRunId: string): Promise<AuditStep[]>;
  updateAuditStep(id: string, updates: Partial<AuditStep>): Promise<AuditStep | undefined>;

  // API Connections
  createOrUpdateApiConnection(connection: InsertApiConnection): Promise<ApiConnection>;
  getAllApiConnections(): Promise<ApiConnection[]>;
  getApiConnection(service: string): Promise<ApiConnection | undefined>;

  // Detected Issues
  createDetectedIssue(issue: InsertDetectedIssue): Promise<DetectedIssue>;
  getDetectedIssuesByRunId(auditRunId: string): Promise<DetectedIssue[]>;
  getAllDetectedIssues(): Promise<DetectedIssue[]>;
  updateDetectedIssue(id: string, updates: Partial<DetectedIssue>): Promise<DetectedIssue | undefined>;
}

export class MemStorage implements IStorage {
  private auditRuns: Map<string, AuditRun> = new Map();
  private environmentVars: Map<string, EnvironmentVar> = new Map();
  private auditSteps: Map<string, AuditStep> = new Map();
  private apiConnections: Map<string, ApiConnection> = new Map();
  private detectedIssues: Map<string, DetectedIssue> = new Map();

  constructor() {
    // Initialize with default API connections
    const defaultConnections = [
      { service: "prokerala", status: "connected" as const, responseTime: "120ms" },
      { service: "razorpay", status: "connected" as const, responseTime: "95ms" },
      { service: "goaffpro", status: "error" as const, errorMessage: "Authentication failed" },
    ];

    defaultConnections.forEach(conn => {
      const id = randomUUID();
      this.apiConnections.set(id, { 
        id, 
        ...conn, 
        lastChecked: new Date(),
        errorMessage: conn.errorMessage || null,
        responseTime: conn.responseTime || null,
      });
    });
  }

  // Audit Runs
  async createAuditRun(insertAuditRun: InsertAuditRun): Promise<AuditRun> {
    const id = randomUUID();
    const auditRun: AuditRun = { 
      ...insertAuditRun, 
      id, 
      status: insertAuditRun.status || 'pending',
      startedAt: new Date(),
      completedAt: null,
      results: insertAuditRun.results || null,
      logs: insertAuditRun.logs || [],
    };
    this.auditRuns.set(id, auditRun);
    return auditRun;
  }

  async getAuditRun(id: string): Promise<AuditRun | undefined> {
    return this.auditRuns.get(id);
  }

  async getAllAuditRuns(): Promise<AuditRun[]> {
    return Array.from(this.auditRuns.values()).sort((a, b) => 
      new Date(b.startedAt!).getTime() - new Date(a.startedAt!).getTime()
    );
  }

  async updateAuditRun(id: string, updates: Partial<AuditRun>): Promise<AuditRun | undefined> {
    const existing = this.auditRuns.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.auditRuns.set(id, updated);
    return updated;
  }

  // Environment Variables
  async createEnvironmentVar(insertEnvVar: InsertEnvironmentVar): Promise<EnvironmentVar> {
    const id = randomUUID();
    const envVar: EnvironmentVar = { 
      ...insertEnvVar, 
      id, 
      service: insertEnvVar.service || null,
      isActive: insertEnvVar.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.environmentVars.set(id, envVar);
    return envVar;
  }

  async getAllEnvironmentVars(): Promise<EnvironmentVar[]> {
    return Array.from(this.environmentVars.values());
  }

  async getEnvironmentVarsByService(service: string): Promise<EnvironmentVar[]> {
    return Array.from(this.environmentVars.values()).filter(env => env.service === service);
  }

  async updateEnvironmentVar(id: string, updates: Partial<EnvironmentVar>): Promise<EnvironmentVar | undefined> {
    const existing = this.environmentVars.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.environmentVars.set(id, updated);
    return updated;
  }

  async deleteEnvironmentVar(id: string): Promise<boolean> {
    return this.environmentVars.delete(id);
  }

  // Audit Steps
  async createAuditStep(insertStep: InsertAuditStep): Promise<AuditStep> {
    const id = randomUUID();
    const step: AuditStep = { 
      ...insertStep, 
      id,
      status: insertStep.status || 'pending',
      output: insertStep.output || null,
      errorMessage: insertStep.errorMessage || null,
      auditRunId: insertStep.auditRunId || null,
      startedAt: null,
      completedAt: null,
    };
    this.auditSteps.set(id, step);
    return step;
  }

  async getAuditStepsByRunId(auditRunId: string): Promise<AuditStep[]> {
    return Array.from(this.auditSteps.values())
      .filter(step => step.auditRunId === auditRunId)
      .sort((a, b) => parseInt(a.stepOrder) - parseInt(b.stepOrder));
  }

  async updateAuditStep(id: string, updates: Partial<AuditStep>): Promise<AuditStep | undefined> {
    const existing = this.auditSteps.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.auditSteps.set(id, updated);
    return updated;
  }

  // API Connections
  async createOrUpdateApiConnection(insertConnection: InsertApiConnection): Promise<ApiConnection> {
    const existing = Array.from(this.apiConnections.values())
      .find(conn => conn.service === insertConnection.service);
    
    if (existing) {
      const updated = { 
        ...existing, 
        ...insertConnection, 
        lastChecked: new Date() 
      };
      this.apiConnections.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const connection: ApiConnection = { 
        ...insertConnection, 
        id, 
        status: insertConnection.status || 'disconnected',
        errorMessage: insertConnection.errorMessage || null,
        responseTime: insertConnection.responseTime || null,
        lastChecked: new Date() 
      };
      this.apiConnections.set(id, connection);
      return connection;
    }
  }

  async getAllApiConnections(): Promise<ApiConnection[]> {
    return Array.from(this.apiConnections.values());
  }

  async getApiConnection(service: string): Promise<ApiConnection | undefined> {
    return Array.from(this.apiConnections.values())
      .find(conn => conn.service === service);
  }

  // Detected Issues
  async createDetectedIssue(insertIssue: InsertDetectedIssue): Promise<DetectedIssue> {
    const id = randomUUID();
    const issue: DetectedIssue = { 
      ...insertIssue, 
      id, 
      auditRunId: insertIssue.auditRunId || null,
      filePath: insertIssue.filePath || null,
      lineNumber: insertIssue.lineNumber || null,
      recommendation: insertIssue.recommendation || null,
      isResolved: insertIssue.isResolved ?? false,
      createdAt: new Date() 
    };
    this.detectedIssues.set(id, issue);
    return issue;
  }

  async getDetectedIssuesByRunId(auditRunId: string): Promise<DetectedIssue[]> {
    return Array.from(this.detectedIssues.values())
      .filter(issue => issue.auditRunId === auditRunId)
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity as keyof typeof severityOrder] - 
               severityOrder[b.severity as keyof typeof severityOrder];
      });
  }

  async getAllDetectedIssues(): Promise<DetectedIssue[]> {
    return Array.from(this.detectedIssues.values());
  }

  async updateDetectedIssue(id: string, updates: Partial<DetectedIssue>): Promise<DetectedIssue | undefined> {
    const existing = this.detectedIssues.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.detectedIssues.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
