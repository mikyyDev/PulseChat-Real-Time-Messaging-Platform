import { Server } from "socket.io";
import { config } from "../config/index.js";
import { arcjetSocketMiddleware } from "../middleware/arcjet.middleware.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

// userId -> Set<socket.id>. Used for presence and multi-device fan-out.
const userSockets = new Map();

let ioInstance = null;

const ROOM_PREFIX = "user:";
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
const TYPING_THROTTLE_MS = 400;

/** Room every socket of a user joins, so one emit reaches all their devices. */
export function userRoom(userId) {
  return `${ROOM_PREFIX}${userId}`;
}

export function getOnlineUsers() {
  return Array.from(userSockets.keys());
}

export function isUserOnline(userId) {
  if (!userId) return false;
  const sockets = userSockets.get(String(userId));
  return Boolean(sockets && sockets.size > 0);
}

export function emitToUser(userId, event, payload) {
  if (!ioInstance || !userId) return false;

  const room = userRoom(String(userId));
  if (!userSockets.has(String(userId))) return false;

  ioInstance.to(room).emit(event, payload);
  return true;
}

function buildCorsOptions() {
  const allowedOrigins = new Set(
    [
      config.frontendUrl,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
    ].filter(Boolean),
  );

  return {
    origin: (origin, callback) => {
      // No origin header: native clients, curl, server-to-server.
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      if (config.env !== "production") return callback(null, true);
      return callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST"],
  };
}

export function initSocket(httpServer) {
  if (ioInstance) return ioInstance;

  ioInstance = new Server(httpServer, {
    cors: buildCorsOptions(),
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // Abuse protection first, then identity.
  if (config.arcjetApiKey) {
    ioInstance.use(arcjetSocketMiddleware);
  }
  ioInstance.use(socketAuthMiddleware);

  ioInstance.on("connection", (socket) => {
    const userId = socket.userId;
    const room = userRoom(userId);

    const wasOffline = !userSockets.has(userId);
    if (wasOffline) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);

    socket.join(room);

    // Give the new socket the current presence snapshot; tell the rest of the
    // app only when this user actually went online.
    const onlineUsers = getOnlineUsers();
    socket.emit("getOnlineUsers", onlineUsers);
    if (wasOffline) socket.broadcast.emit("getOnlineUsers", onlineUsers);

    let lastTypingAt = 0;

    const relayTyping = (event, toUserId, { throttle = false } = {}) => {
      // Only relay to a plausible user id; never echo the raw payload back.
      if (typeof toUserId !== "string" || !OBJECT_ID_REGEX.test(toUserId))
        return;

      if (throttle) {
        const now = Date.now();
        if (now - lastTypingAt < TYPING_THROTTLE_MS) return;
        lastTypingAt = now;
      }

      socket.to(userRoom(toUserId)).emit(event, { fromUserId: userId });
    };

    socket.on("typing", (payload = {}) => {
      relayTyping("userTyping", payload?.toUserId, { throttle: true });
    });

    // Not throttled: a dropped "stop" would leave the indicator stuck on.
    socket.on("stopTyping", (payload = {}) => {
      relayTyping("userStoppedTyping", payload?.toUserId);
    });

    socket.on("disconnect", () => {
      const sockets = userSockets.get(userId);
      if (!sockets) return;

      sockets.delete(socket.id);
      if (sockets.size > 0) return; // another tab/device is still connected

      userSockets.delete(userId);
      ioInstance.emit("getOnlineUsers", getOnlineUsers());
    });
  });

  return ioInstance;
}

/** Closes the server (and its HTTP server) and clears presence state. */
export async function closeSocket() {
  if (!ioInstance) return;

  const instance = ioInstance;
  ioInstance = null;
  userSockets.clear();

  await new Promise((resolve) => instance.close(resolve));
}

export default initSocket;
