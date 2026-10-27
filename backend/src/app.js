import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import messageRoutes from "./routes/message.route.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.route.js";

import { config } from "./config/index.js";
import { connectDB } from "./config/db.js";

const app = express();

// Global middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

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

// Error handling middleware (must be after routes)
app.use(errorHandler);

export default app;
