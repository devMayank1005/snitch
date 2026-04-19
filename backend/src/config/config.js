import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "MONGODB_URI",
  "NODE_ENV",
  "PORT",
  "BREVO_SMTP_HOST",
  "BREVO_SMTP_PORT",
  "BREVO_SMTP_USER",
  "BREVO_SMTP_PASSWORD",
  "SMTP_FROM_EMAIL",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is not defined in environment variables`);
  }
});

export const config = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV || "development",
  
  // JWT Secrets for dual-token strategy
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiry: "15m",    // Access token expires in 15 minutes
  jwtRefreshExpiry: "7d",    // Refresh token expires in 7 days
  
  // Email Configuration
  smtp: {
    host: process.env.BREVO_SMTP_HOST,
    port: parseInt(process.env.BREVO_SMTP_PORT),
    user: process.env.BREVO_SMTP_USER,
    password: process.env.BREVO_SMTP_PASSWORD,
    fromEmail: process.env.SMTP_FROM_EMAIL,
  },
};
