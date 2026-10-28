import { Resend } from "resend";
import { config } from "../config/index.js";

export const resendClient = config.resendApiKey
  ? new Resend(config.resendApiKey)
  : null;

export const sender = {
  email: config.emailFrom.replace(/^"|"$/g, '').trim(),
  name: config.emailFromName.replace(/^"|"$/g, '').trim(),
};
