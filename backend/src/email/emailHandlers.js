import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  // DEBUG: show which env vars are in use
  console.log('Resend client configured? ', !!resendClient);
  console.log('Sender email: ', sender.email);
  console.log('Frontend URL: ', clientURL);
  if (!resendClient) {
    console.error('Resend client missing – check RESEND_API_KEY in .env');
    throw new Error('Resend client is not configured');
  }

  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: "Welcome to PulseChat!",
    html: createWelcomeEmailTemplate(name, clientURL),
  });

  if (error) {
    console.error("Error sending welcome email:", error);
    // If the error is due to missing env configuration, give a clearer hint
    if (!resendClient) {
      console.error("Resend client is not configured – check RESEND_API_KEY in .env");
    }
    if (!sender.email) {
      console.error("Sender email not set – check EMAIL_FROM in .env");
    }
    throw new Error("Failed to send welcome email");
  }

  console.log("Welcome Email sent successfully", data);
};
