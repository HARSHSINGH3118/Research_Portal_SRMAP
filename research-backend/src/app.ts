import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "path";                
import fs from "fs";                    
import { env } from "./config/env";
import { healthRouter } from "./routes/health.route";
import { authRouter } from "./routes/auth.route";
import { paperRouter } from "./routes/paper.route";
import { reviewRouter } from "./routes/review.route";
import { eventRouter } from "./routes/event.route";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // ✅ Ensure uploads directory exists and is served statically at /uploads
  const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOADS_ROOT, { recursive: true });

// Serve /uploads publicly
app.use("/uploads", express.static(UPLOADS_ROOT));
  // ✅ API routes
  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/paper", paperRouter);
  app.use("/api/review", reviewRouter);
  app.use("/api/events", eventRouter);

  app.use((_req, res) => res.status(404).json({ ok: false, message: "Not Found" }));
  return app;
};
