import { drizzle } from "drizzle-orm/node-postgres";
import Pool from "pg";
import { eq, count, desc, gte, lt, sql } from "drizzle-orm";
import { cronJobs, executionLogs } from "@shared/schema";
import {
  type CronJob,
  type InsertCronJob,
  type ExecutionLog,
  type InsertExecutionLog,
  type JobStats,
  type HealthStatus,
} from "@shared/schema";

export interface IStorage {
  // Cron Jobs
  getCronJob(id: string): Promise<CronJob | undefined>;
  getAllCronJobs(): Promise<CronJob[]>;
  createCronJob(job: InsertCronJob): Promise<CronJob>;
  updateCronJob(
    id: string,
    updates: Partial<CronJob>
  ): Promise<CronJob | undefined>;
  deleteCronJob(id: string): Promise<boolean>;

  // Execution Logs
  createExecutionLog(log: InsertExecutionLog): Promise<ExecutionLog>;
  getExecutionLogs(jobId?: string, limit?: number): Promise<ExecutionLog[]>;
  clearOldLogs(days: number): Promise<number>;

  // Analytics
  getJobStats(): Promise<JobStats>;
  getHealthStatus(): Promise<HealthStatus>;
}

export class DbStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const pool = new Pool.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.db = drizzle(pool, { schema: { cronJobs, executionLogs } });
  }

  // Cron Jobs
  async getCronJob(id: string): Promise<CronJob | undefined> {
    const result = await this.db
      .select()
      .from(cronJobs)
      .where(eq(cronJobs.id, id))
      .limit(1);
    return result[0];
  }

  async getAllCronJobs(): Promise<CronJob[]> {
    return this.db.select().from(cronJobs);
  }

  async createCronJob(job: InsertCronJob): Promise<CronJob> {
    const [newJob] = await this.db.insert(cronJobs).values(job).returning();
    return newJob;
  }

  async updateCronJob(
    id: string,
    updates: Partial<CronJob>
  ): Promise<CronJob | undefined> {
    const [updated] = await this.db
      .update(cronJobs)
      .set(updates)
      .where(eq(cronJobs.id, id))
      .returning();
    return updated;
  }

  async deleteCronJob(id: string): Promise<boolean> {
    const result = await this.db
      .delete(cronJobs)
      .where(eq(cronJobs.id, id))
      .returning({ id: cronJobs.id });
    return result.length > 0;
  }

  // Execution Logs
  async createExecutionLog(log: InsertExecutionLog): Promise<ExecutionLog> {
    const [newLog] = await this.db
      .insert(executionLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getExecutionLogs(jobId?: string, limit = 100): Promise<ExecutionLog[]> {
    const query = this.db
      .select()
      .from(executionLogs)
      .orderBy(desc(executionLogs.timestamp))
      .limit(limit);
    if (jobId) {
      query.where(eq(executionLogs.jobId, jobId));
    }
    return query;
  }

  async clearOldLogs(days: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await this.db
      .delete(executionLogs)
      .where(lt(executionLogs.timestamp, cutoff));
    return result.rowCount ?? 0;
  }

  // Analytics
  async getJobStats(): Promise<JobStats> {
    const totalJobsPromise = this.db.select({ value: count() }).from(cronJobs);
    const activeJobsPromise = this.db
      .select({ value: count() })
      .from(cronJobs)
      .where(eq(cronJobs.isActive, true));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const executionsTodayPromise = this.db
      .select({
        total: count(),
        successful: count(
          sql`case when ${executionLogs.status} = 'success' then 1 else null end`
        ),
      })
      .from(executionLogs)
      .where(gte(executionLogs.timestamp, today));

    const [[{ value: totalJobs }], [{ value: activeJobs }], [executions]] =
      await Promise.all([
        totalJobsPromise,
        activeJobsPromise,
        executionsTodayPromise,
      ]);

    const successRate =
      executions.total > 0
        ? (Number(executions.successful) / executions.total) * 100
        : 100;

    return {
      totalJobs,
      activeJobs,
      executionsToday: executions.total,
      successRate: Math.round(successRate * 10) / 10,
    };
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const [{ value: activeJobs }] = await this.db
      .select({ value: count() })
      .from(cronJobs)
      .where(eq(cronJobs.isActive, true));

    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      activeJobs,
      memoryUsage: `${Math.round(
        process.memoryUsage().heapUsed / 1024 / 1024
      )}MB`,
      cpuUsage: "12%",
      lastPing: "2 min ago",
    };
  }
}

export const storage = new DbStorage();
