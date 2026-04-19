import nodemailer from "nodemailer";
import { config } from "./config.js";

// Create transporter for Brevo SMTP
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465, // true for 465, false for other ports
  auth: {
    user: config.smtp.user,
    pass: config.smtp.password,
  },
});

/**
 * Send email verification link
 * @param {string} email - User's email address
 * @param {string} verificationToken - Token to verify email
 */
export const sendVerificationEmail = async (email, verificationToken) => {
  const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;

  const mailOptions = {
    from: config.smtp.fromEmail,
    to: email,
    subject: "Verify Your Snitch Account Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Snitch!</h2>
        <p>Thank you for signing up. Please verify your email address to activate your account.</p>
        <p>
          <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p><code>${verificationLink}</code></p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
        <hr />
        <small style="color: #666;">Define your aesthetic | Snitch Marketplace</small>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send password reset link
 * @param {string} email - User's email address
 * @param {string} resetToken - Token to reset password
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

  const mailOptions = {
    from: config.smtp.fromEmail,
    to: email,
    subject: "Reset Your Snitch Account Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to reset it.</p>
        <p>
          <a href="${resetLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p><code>${resetLink}</code></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support.</p>
        <hr />
        <small style="color: #666;">Define your aesthetic | Snitch Marketplace</small>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Test email configuration by sending a test email
 */
export const testEmailConfig = async (testEmail) => {
  const mailOptions = {
    from: config.smtp.fromEmail,
    to: testEmail,
    subject: "Snitch Email Configuration Test",
    html: "<p>Email service is working correctly!</p>",
  };

  return transporter.sendMail(mailOptions);
};

export default transporter;
