import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCronJobSchema, insertExecutionLogSchema } from "@shared/schema";
import cron from "node-cron";

// Store active cron jobs
const activeJobs = new Map();

// Middleware to check API key
const apiKeyMiddleware = (req: any, res: any, next: any) => {
  const apiKey = req.headers["x-api-key"];
  const expectedKey =
    process.env.API_KEY ||
    process.env.CRON_API_KEY ||
    "86484wuhihae873haoq-sjdb.jaoan";

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized - Invalid API Key" });
  }
  next();
};

// Function to start a cron job
function startJob(
  id: string,
  url: string,
  schedule: string,
  cronSecret?: string,
  body?: any
) {
  // Stop existing job if any
  if (activeJobs.has(id)) {
    activeJobs.get(id).stop();
  }

  // Create and start new job
  const job = cron.schedule(schedule, async () => {
    const startTime = Date.now();

    try {
      const headers: any = {
        "Content-Type": "application/json",
      };

      // Add authorization header if cronSecret is provided
      if (cronSecret) {
        headers["Authorization"] = `Bearer ${cronSecret}`;
      }

      const response = await fetch(url, {
        method: "POST",
        body,
        headers,
      });

      const duration = Date.now() - startTime;
      const timestamp = new Date().toISOString();

      // Log execution
      await storage.createExecutionLog({
        jobId: id,
        status: response.ok ? "success" : "error",
        responseCode: response.status,
        duration,
        errorMessage: response.ok
          ? undefined
          : `HTTP ${response.status}: ${response.statusText}`,
      });

      console.log(
        `[${timestamp}] Job ${id} executed: ${response.status} (${duration}ms)`
      );
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const timestamp = new Date().toISOString();

      // Log error
      await storage.createExecutionLog({
        jobId: id,
        status: "error",
        responseCode: 0,
        duration,
        errorMessage: error.message,
      });

      console.error(`[${timestamp}] Error executing job ${id}:`, error.message);
    }
  });

  activeJobs.set(id, job);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const health = await storage.getHealthStatus();
      res.json(health);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get job statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getJobStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all cron jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllCronJobs();
      // Remove sensitive data (cronSecret) from response
      const sanitizedJobs = jobs.map(({ cronSecret, ...job }) => job);
      res.json(sanitizedJobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new cron job
  app.post("/api/jobs", apiKeyMiddleware, async (req, res) => {
    try {
      const validatedData = insertCronJobSchema.parse(req.body);

      // Validate cron schedule
      if (!cron.validate(validatedData.schedule)) {
        return res.status(400).json({ error: "Invalid cron schedule" });
      }

      // Check if job already exists
      const existing = await storage.getCronJob(validatedData.id);
      if (existing) {
        return res
          .status(409)
          .json({ error: "Job with this ID already exists" });
      }

      const job = await storage.createCronJob(validatedData);
      startJob(job.id, job.url, job.schedule, job.cronSecret, job.body);

      // Remove sensitive data from response
      const { cronSecret, ...safeJob } = job;
      res.status(201).json(safeJob);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update a cron job
  app.put("/api/jobs/:id", apiKeyMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Validate schedule if provided
      if (updates.schedule && !cron.validate(updates.schedule)) {
        return res.status(400).json({ error: "Invalid cron schedule" });
      }

      const updatedJob = await storage.updateCronJob(id, updates);
      if (!updatedJob) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Restart job if schedule changed
      if (
        updates.schedule ||
        updates.url ||
        updates.cronSecret !== undefined ||
        updatedJob.body !== undefined
      ) {
        startJob(
          updatedJob.id,
          updatedJob.url,
          updatedJob.schedule,
          updatedJob.cronSecret,
          updatedJob.body
        );
      }

      // Remove sensitive data from response
      const { cronSecret, ...safeJob } = updatedJob;
      res.json(safeJob);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a cron job
  app.delete("/api/jobs/:id", apiKeyMiddleware, async (req, res) => {
    try {
      const { id } = req.params;

      const deleted = await storage.deleteCronJob(id);
      if (!deleted) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Stop the job if it's running
      if (activeJobs.has(id)) {
        activeJobs.get(id).stop();
        activeJobs.delete(id);
      }

      res.json({ message: "Job deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get execution logs
  app.get("/api/logs", async (req, res) => {
    try {
      const { jobId, limit } = req.query;
      const logs = await storage.getExecutionLogs(
        jobId as string | undefined,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Clear old logs
  app.delete("/api/logs", apiKeyMiddleware, async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const cleared = await storage.clearOldLogs(parseInt(days as string));
      res.json({ message: `Cleared ${cleared} log entries` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Initialize existing jobs on startup
  const initializeJobs = async () => {
    const jobs = await storage.getAllCronJobs();
    jobs.forEach((job) => {
      if (job.isActive) {
        startJob(job.id, job.url, job.schedule, job.cronSecret, job.body);
      }
    });
    console.log(
      `Initialized ${jobs.filter((j) => j.isActive).length} active cron jobs`
    );
  };

  // Self-ping to prevent sleep
  const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
  const setupSelfPing = () => {
    const serverUrl = process.env.SERVER_URL || `http://localhost:5000`;
    setInterval(async () => {
      try {
        await fetch(`${serverUrl}/api/health`);
        console.log(`[${new Date().toISOString()}] Self-ping successful`);
      } catch (error: any) {
        console.error(
          `[${new Date().toISOString()}] Self-ping failed:`,
          error.message
        );
      }
    }, PING_INTERVAL);
  };

  const httpServer = createServer(app);

  // Initialize jobs and self-ping after server starts
  httpServer.on("listening", () => {
    initializeJobs();
    setupSelfPing();
  });

  return httpServer;
}
