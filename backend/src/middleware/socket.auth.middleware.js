import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

const BEARER_REGEX = /^Bearer\s+(.+)$/i;

/** Reads a single cookie value out of a raw Cookie header. */
function readCookie(cookieHeader, name) {
  if (typeof cookieHeader !== "string" || !cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;

    const key = part.slice(0, separator).trim();
    if (key !== name) continue;

    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Token sources, most explicit first:
 *  1. `io(url, { auth: { token } })`
 *  2. `Authorization: Bearer <token>` handshake header
 *  3. the httpOnly `token` cookie set by the auth routes
 *
 * A query-string userId fallback is deliberately NOT supported: it would let
 * anyone impersonate any user without a token.
 */
function extractHandshakeToken(socket) {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) {
    const bearer = BEARER_REGEX.exec(authToken.trim());
    return (bearer ? bearer[1] : authToken).trim();
  }

  const header = socket.handshake.headers?.authorization;
  if (typeof header === "string" && header.trim()) {
    const bearer = BEARER_REGEX.exec(header.trim());
    if (bearer) return bearer[1].trim();
  }

  return readCookie(socket.handshake.headers?.cookie, "token");
}

// Same verification policy as the HTTP `protect` middleware.
const verifyOptions = {
  algorithms: ["HS256"],
  clockTolerance: 5,
  ...(config.jwtIssuer && { issuer: config.jwtIssuer }),
  ...(config.jwtAudience && { audience: config.jwtAudience }),
};

/**
 * Socket.IO handshake authentication.
 *
 * Rejects the connection before it is established unless a valid, unexpired
 * JWT is presented. On success the verified user id is attached to the socket
 * so handlers never have to trust client-supplied identity.
 */
export const socketAuthMiddleware = (socket, next) => {
  const token = extractHandshakeToken(socket);

  if (!token) {
    return next(new Error("UNAUTHORIZED: missing credentials"));
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, verifyOptions);
  } catch (error) {
    const expired = error?.name === "TokenExpiredError";
    return next(
      new Error(
        expired ? "UNAUTHORIZED: token expired" : "UNAUTHORIZED: token invalid",
      ),
    );
  }

  const userId = payload?.sub ?? payload?.id;
  if (typeof userId !== "string" && typeof userId !== "number") {
    return next(new Error("UNAUTHORIZED: invalid token payload"));
  }

  socket.userId = String(userId);
  socket.tokenPayload = payload;
  return next();
};

export default socketAuthMiddleware;
