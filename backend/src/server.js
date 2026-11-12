import app from "./app.js";
import { config } from "./config/index.js";

const PORT = config.port;

const server = app.listen(PORT, () => {
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
