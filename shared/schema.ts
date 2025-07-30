import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cronJobs = pgTable("cron_jobs", {
  id: varchar("id").primaryKey(),
  url: text("url").notNull(),
  schedule: text("schedule").notNull(),
  body: text("body"),
  cronSecret: text("cron_secret"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  createdBy: text("created_by").notNull().default("JIMEX-X"),
  isActive: boolean("is_active").notNull().default(true),
});

export const executionLogs = pgTable("execution_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  timestamp: timestamp("timestamp")
    .notNull()
    .default(sql`now()`),
  status: text("status").notNull(), // 'success' | 'error'
  responseCode: integer("response_code"),
  duration: integer("duration"), // in milliseconds
  errorMessage: text("error_message"),
});

export const insertCronJobSchema = createInsertSchema(cronJobs).omit({
  createdAt: true,
  createdBy: true,
});

export const insertExecutionLogSchema = createInsertSchema(executionLogs).omit({
  id: true,
  timestamp: true,
});

export type CronJob = typeof cronJobs.$inferSelect;
export type InsertCronJob = z.infer<typeof insertCronJobSchema>;
export type ExecutionLog = typeof executionLogs.$inferSelect;
export type InsertExecutionLog = z.infer<typeof insertExecutionLogSchema>;

// API response types
export type JobStats = {
  totalJobs: number;
  activeJobs: number;
  executionsToday: number;
  successRate: number;
};

export type HealthStatus = {
  status: string;
  timestamp: string;
  activeJobs: number;
  memoryUsage?: string;
  cpuUsage?: string;
  lastPing?: string;
};
