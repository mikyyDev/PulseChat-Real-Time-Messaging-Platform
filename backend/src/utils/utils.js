import { config } from "../config/index.js";
import jwt from "jsonwebtoken";

/** Extract JWT token from cookies or Authorization header */
export const extractToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1].trim();
  }
  return null;
};

/** Require a valid JWT and attach its user ID to the request. */
const protect = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.id || decoded.sub;

    if (!req.userId) {
      return res
        .status(401)
        .json({ message: "Not authorized, invalid token payload" });
    }

    return next();
  } catch {
    return res
      .status(401)
      .json({ message: "Not authorized, token invalid or expired" });
  }
};

export default protect;
