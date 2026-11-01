import { aj, messageLimiter } from "../lib/arcjet.js";

// Express middleware: protects HTTP routes
export const protectArcjet = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      let isRateLimit = decision.reason?.isRateLimit?.();
      let isBot = decision.reason?.isBot?.();
      let isShield = decision.reason?.isShield?.();

      if (!isRateLimit && !isBot && !isShield && Array.isArray(decision.results)) {
        for (const res of decision.results) {
          if (res.isDenied?.() || res.conclusion === "DENY") {
            if (res.reason?.isRateLimit?.()) isRateLimit = true;
            if (res.reason?.isBot?.()) isBot = true;
            if (res.reason?.isShield?.()) isShield = true;
          }
        }
      }

      if (isRateLimit) {
        return res.status(429).json({ message: "Too many requests. Please try again later." });
      }
      if (isBot) {
        return res.status(403).json({ message: "Automated bots are not allowed." });
      }
      if (isShield) {
        return res.status(403).json({ message: "Suspicious activity detected." });
      }
      return res.status(403).json({ message: "Access forbidden." });
    }

    next();
  } catch (err) {
    console.error("Arcjet error:", err);
    next(); // fail open so an Arcjet outage doesn't take down your app
  }
};

// Alias for protectArcjet
export const arcjetMiddleware = protectArcjet;

// Socket.IO middleware: protects connection handshake if WebSockets are used
export const arcjetSocketMiddleware = async (socket, next) => {
  try {
    const decision = await aj.protect(socket.request);

    if (decision.isDenied()) {
      return next(new Error("Forbidden"));
    }

    next();
  } catch (err) {
    console.error("Arcjet socket error:", err);
    next(); // fail open
  }
};

// Per-message check: call this inside message handlers
// Returns true if the message is allowed
export const checkMessageLimit = async (reqOrSocket, userId) => {
  try {
    const decision = await messageLimiter.protect(reqOrSocket, {
      userId: String(userId),
      requested: 1,
    });

    return !decision.isDenied();
  } catch (err) {
    console.error("Arcjet message limiter error:", err);
    return true; // fail open
  }
};
