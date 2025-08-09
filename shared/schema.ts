import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const auditRuns = pgTable("audit_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  results: jsonb("results"),
  logs: jsonb("logs").default(sql`'[]'::jsonb`),
});

export const environmentVars = pgTable("environment_vars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  service: text("service"), // prokerala, razorpay, goaffpro
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const auditSteps = pgTable("audit_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditRunId: varchar("audit_run_id").references(() => auditRuns.id),
  stepName: text("step_name").notNull(),
  stepOrder: text("step_order").notNull(),
  status: text("status").notNull().default("pending"), // pending, running, success, failed
  output: text("output"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const apiConnections = pgTable("api_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  service: text("service").notNull().unique(), // prokerala, razorpay, goaffpro
  status: text("status").notNull().default("disconnected"), // connected, disconnected, error
  lastChecked: timestamp("last_checked"),
  errorMessage: text("error_message"),
  responseTime: text("response_time"),
});

export const detectedIssues = pgTable("detected_issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditRunId: varchar("audit_run_id").references(() => auditRuns.id),
  type: text("type").notNull(), // form_input, api_connection, environment, build
  severity: text("severity").notNull(), // critical, high, medium, low
  title: text("title").notNull(),
  description: text("description").notNull(),
  filePath: text("file_path"),
  lineNumber: text("line_number"),
  recommendation: text("recommendation"),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertAuditRunSchema = createInsertSchema(auditRuns).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertEnvironmentVarSchema = createInsertSchema(environmentVars).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditStepSchema = createInsertSchema(auditSteps).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertApiConnectionSchema = createInsertSchema(apiConnections).omit({
  id: true,
  lastChecked: true,
});

export const insertDetectedIssueSchema = createInsertSchema(detectedIssues).omit({
  id: true,
  createdAt: true,
});

// Types
export type AuditRun = typeof auditRuns.$inferSelect;
export type InsertAuditRun = z.infer<typeof insertAuditRunSchema>;

export type EnvironmentVar = typeof environmentVars.$inferSelect;
export type InsertEnvironmentVar = z.infer<typeof insertEnvironmentVarSchema>;

export type AuditStep = typeof auditSteps.$inferSelect;
export type InsertAuditStep = z.infer<typeof insertAuditStepSchema>;

export type ApiConnection = typeof apiConnections.$inferSelect;
export type InsertApiConnection = z.infer<typeof insertApiConnectionSchema>;

export type DetectedIssue = typeof detectedIssues.$inferSelect;
export type InsertDetectedIssue = z.infer<typeof insertDetectedIssueSchema>;
