import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import messageRoutes from "./routes/message.route.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.route.js";
import { arcjetMiddleware } from "./middleware/arcjet.middleware.js";

import { config } from "./config/index.js";
import { connectDB } from "./config/db.js";

const app = express();

// Global middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Root health check (bypasses Arcjet so tools and monitoring always work)
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "PulseChat backend is running" });
});

// Global Arcjet security (Shield, Bot detection, Rate limiting) on all /api routes
app.use("/api", arcjetMiddleware);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "PulseChat API is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve static files in production
if (config.env === "production") {
  const staticPath = path.join(config.__dirname, "..", "frontend", "dist");
  app.use(express.static(staticPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}
// 404 handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

export default app;
