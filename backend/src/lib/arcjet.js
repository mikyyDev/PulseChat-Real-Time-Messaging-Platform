import arcjet, {
  shield,
  detectBot,
  slidingWindow,
  tokenBucket,
  createRemoteClient,
} from "@arcjet/node";
import { config } from "../config/index.js";

// Custom client with 5s timeout to prevent latency timeouts in development
const client = createRemoteClient({ timeout: 5000 });

// HTTP protection (Shield, bot detection, IP rate limiting)
export const aj = arcjet({
  key: config.arcjetApiKey || process.env.ARCJET_KEY,
  client,
  rules: [
    shield({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
    }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    slidingWindow({
      mode: "LIVE",
      interval: 60, // 60 seconds
      max: 60, // 60 requests per minute
    }),
  ],
});

// Per-user message rate limiter (for chat messages or WebSockets)
export const messageLimiter = arcjet({
  key: config.arcjetApiKey || process.env.ARCJET_KEY,
  characteristics: ["userId"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 2, // 2 tokens per second
      interval: "1s",
      capacity: 10, // burst limit of 10
    }),
  ],
});
