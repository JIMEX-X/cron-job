import { type CronJob, type InsertCronJob, type ExecutionLog, type InsertExecutionLog, type JobStats, type HealthStatus } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Cron Jobs
  getCronJob(id: string): Promise<CronJob | undefined>;
  getAllCronJobs(): Promise<CronJob[]>;
  createCronJob(job: InsertCronJob): Promise<CronJob>;
  updateCronJob(id: string, updates: Partial<CronJob>): Promise<CronJob | undefined>;
  deleteCronJob(id: string): Promise<boolean>;
  
  // Execution Logs
  createExecutionLog(log: InsertExecutionLog): Promise<ExecutionLog>;
  getExecutionLogs(jobId?: string, limit?: number): Promise<ExecutionLog[]>;
  clearOldLogs(days: number): Promise<number>;
  
  // Analytics
  getJobStats(): Promise<JobStats>;
  getHealthStatus(): Promise<HealthStatus>;
}

export class MemStorage implements IStorage {
  private cronJobs: Map<string, CronJob>;
  private executionLogs: Map<string, ExecutionLog>;

  constructor() {
    this.cronJobs = new Map();
    this.executionLogs = new Map();
  }

  // Cron Jobs
  async getCronJob(id: string): Promise<CronJob | undefined> {
    return this.cronJobs.get(id);
  }

  async getAllCronJobs(): Promise<CronJob[]> {
    return Array.from(this.cronJobs.values());
  }

  async createCronJob(job: InsertCronJob): Promise<CronJob> {
    const cronJob: CronJob = {
      ...job,
      createdAt: new Date(),
      createdBy: "JIMEX-X",
      isActive: true,
    };
    this.cronJobs.set(job.id, cronJob);
    return cronJob;
  }

  async updateCronJob(id: string, updates: Partial<CronJob>): Promise<CronJob | undefined> {
    const existing = this.cronJobs.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.cronJobs.set(id, updated);
    return updated;
  }

  async deleteCronJob(id: string): Promise<boolean> {
    return this.cronJobs.delete(id);
  }

  // Execution Logs
  async createExecutionLog(log: InsertExecutionLog): Promise<ExecutionLog> {
    const executionLog: ExecutionLog = {
      id: randomUUID(),
      ...log,
      timestamp: new Date(),
    };
    this.executionLogs.set(executionLog.id, executionLog);
    return executionLog;
  }

  async getExecutionLogs(jobId?: string, limit: number = 100): Promise<ExecutionLog[]> {
    let logs = Array.from(this.executionLogs.values());
    
    if (jobId) {
      logs = logs.filter(log => log.jobId === jobId);
    }
    
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async clearOldLogs(days: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    let cleared = 0;
    for (const [id, log] of this.executionLogs.entries()) {
      if (new Date(log.timestamp) < cutoff) {
        this.executionLogs.delete(id);
        cleared++;
      }
    }
    
    return cleared;
  }

  // Analytics
  async getJobStats(): Promise<JobStats> {
    const jobs = Array.from(this.cronJobs.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const logsToday = Array.from(this.executionLogs.values()).filter(
      log => new Date(log.timestamp) >= today
    );
    
    const successfulToday = logsToday.filter(log => log.status === 'success').length;
    const successRate = logsToday.length > 0 ? (successfulToday / logsToday.length) * 100 : 100;
    
    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(job => job.isActive).length,
      executionsToday: logsToday.length,
      successRate: Math.round(successRate * 10) / 10,
    };
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const activeJobs = Array.from(this.cronJobs.values()).filter(job => job.isActive).length;
    
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      activeJobs,
      memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      cpuUsage: "12%",
      lastPing: "2 min ago",
    };
  }
}

export const storage = new MemStorage();
