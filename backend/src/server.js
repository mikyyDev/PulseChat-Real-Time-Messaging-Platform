import http from "http";
import mongoose from "mongoose";
import app from "./app.js";
import { config } from "./config/index.js";
import { closeSocket, initSocket } from "./lib/socket.js";

const PORT = config.port;

const server = http.createServer(app);

// Initialize Socket.io on the HTTP server
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use by another process. Please stop the other process or change PORT in .env.`,
    );
  } else {
    console.error("Server error:", error);
  }
  process.exit(1);
});

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} received — shutting down`);

  const forceExit = setTimeout(() => {
    console.error("Shutdown timed out after 10s, forcing exit");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  try {
    await closeSocket();
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error during shutdown:", error);
  } finally {
    clearTimeout(forceExit);
    process.exit(0);
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    void shutdown(signal);
  });
}
