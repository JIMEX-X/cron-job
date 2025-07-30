// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import type { ListenOptions } from "node:net";
import os from "node:os";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Compact API logger with JSON capture
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json.bind(res);
  // Capture JSON bodies for logging (avoid mutating types on res.json signature)
  (res as any).json = (bodyJson: any, ...args: any[]) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {}
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status ?? err?.statusCode ?? 500;
    const message = err?.message ?? "Internal Server Error";
    res.status(status).json({ message });
    if (status >= 500) {
      console.error("[unhandled-error]", err);
    }
  });

  // if (app.get("env") === "development") {
  // } else {
  //   serveStatic(app);
  // }
  await setupVite(app, server);

  const port = Number.parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";

  // Only enable reusePort when explicitly asked AND platform is likely to support it
  const enableReusePort =
    process.env.ENABLE_REUSEPORT === "1" &&
    process.platform !== "win32" &&
    // macOS and Linux generally OK; allow override via env only.
    ["linux", "darwin"].includes(process.platform);

  const listenOptions: ListenOptions = { port, host };
  // @ts-expect-error - reusePort is a valid ListenOptions key at runtime
  if (enableReusePort) listenOptions.reusePort = true;

  server.on("error", (err) => {
    // Surface listen/bind errors clearly
    console.error("[server.listen:error]", err);
    if ((err as any).code === "EADDRINUSE") {
      console.error(
        `Port ${port} is already in use. Set PORT to a free port or kill the running process.`
      );
    }
    if ((err as any).code === "ENOTSUP") {
      console.error(
        `reusePort is not supported on this platform. Remove ENABLE_REUSEPORT=1 or disable reusePort.`
      );
    }
    process.exitCode = 1;
  });

  server.listen(listenOptions, () => {
    log(
      `serving on ${host}:${port} (node ${process.version}, platform ${
        process.platform
      } ${os.arch()})` + (enableReusePort ? " [reusePort]" : "")
    );
  });
})();
