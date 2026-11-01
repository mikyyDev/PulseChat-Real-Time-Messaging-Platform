import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env (or root .env if present)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI?.trim() || "",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  jwtIssuer: process.env.JWT_ISSUER?.trim() || "",
  jwtAudience: process.env.JWT_AUDIENCE?.trim() || "",
  resendApiKey: process.env.RESEND_API_KEY?.trim() || "",
  emailFrom: process.env.EMAIL_FROM?.trim() || "",
  emailFromName: process.env.EMAIL_FROM_NAME?.trim() || "Pulsechat",
  frontendUrl: process.env.FRONTEND_URL?.trim() || "http://localhost:5173",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY?.trim() || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET?.trim() || "",
  __dirname,
  arcjetApiKey:
    (process.env.ARCJET_KEY || process.env.ARCJET_API_KEY)?.trim() || "",
  __dirname,
};
