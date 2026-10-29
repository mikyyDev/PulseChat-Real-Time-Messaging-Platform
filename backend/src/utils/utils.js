import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

const { JsonWebTokenError, TokenExpiredError, NotBeforeError } = jwt;

const BEARER_REGEX = /^Bearer\s+([^\s]+)$/i;

const verifyOptions = {
  algorithms: ["HS256"],
  clockTolerance: 5,
  ...(config.jwtIssuer && { issuer: config.jwtIssuer }),
  ...(config.jwtAudience && { audience: config.jwtAudience }),
};

const unauthorized = (res, reason) =>
  res
    .status(401)
    .set("WWW-Authenticate", 'Bearer realm="api"')
    .json({ message: `Not authorized, ${reason}` });

/**
 * Extract a JWT from the request.
 * Priority: Authorization header (explicit) > cookie (implicit).
 * Returns { token, source } or null.
 */
export const extractToken = (req) => {
  const header = req.headers.authorization;
  if (typeof header === "string") {
    const match = BEARER_REGEX.exec(header.trim());
    if (match) return { token: match[1], source: "header" };
  }

  const cookieToken = req.cookies?.token;
  if (typeof cookieToken === "string" && cookieToken) {
    return { token: cookieToken, source: "cookie" };
  }

  return null;
};

/** Require a valid JWT and attach the user ID to the request. */
const protect = (req, res, next) => {
  const extracted = extractToken(req);
  if (!extracted) return unauthorized(res, "token missing");

  try {
    const payload = jwt.verify(
      extracted.token,
      config.jwtSecret,
      verifyOptions,
    );

    const userId = payload.sub ?? payload.id;
    if (
      (typeof userId !== "string" || userId === "") &&
      typeof userId !== "number"
    ) {
      return unauthorized(res, "invalid token payload");
    }

    req.userId = String(userId);
    req.authSource = extracted.source; // lets CSRF middleware target cookie auth only
    return next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return unauthorized(res, "token expired");
    }
    if (err instanceof NotBeforeError || err instanceof JsonWebTokenError) {
      return unauthorized(res, "token invalid");
    }
    return next(err); // misconfiguration or a bug: let the error handler log it
  }
};

export default protect;
