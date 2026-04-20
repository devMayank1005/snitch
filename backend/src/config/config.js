import dotenv from "dotenv";
dotenv.config();

const getRequiredEnv = (name) => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`${name} is not defined in environment variables`);
  }
  return value;
};

const parseRequiredPort = (name) => {
  const value = getRequiredEnv(name);
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    throw new Error(`${name} must be a valid number`);
  }

  return parsed;
};

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
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK_URL",
  "FRONTEND_URL",
  "IMAGE_KIT_PRIVATE_KEY",
  "IMAGE_KIT_PUBLIC_KEY",
  "IMAGE_KIT_URL_ENDPOINT",
];

requiredEnvVars.forEach(getRequiredEnv);

export const config = {
  port: parseRequiredPort("PORT"),
  mongodbUri: getRequiredEnv("MONGODB_URI"),
  nodeEnv: getRequiredEnv("NODE_ENV"),

  JWT_ACCESS_SECRET: getRequiredEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getRequiredEnv("JWT_REFRESH_SECRET"),
  jwtAccessExpiry: "15m",
  jwtRefreshExpiry: "7d",

  IMAGE_KIT_PRIVATE_KEY: getRequiredEnv("IMAGE_KIT_PRIVATE_KEY"),
  IMAGE_KIT_PUBLIC_KEY: getRequiredEnv("IMAGE_KIT_PUBLIC_KEY"),
  IMAGE_KIT_URL_ENDPOINT: getRequiredEnv("IMAGE_KIT_URL_ENDPOINT"),

  // Email Configuration
  smtp: {
    host: getRequiredEnv("BREVO_SMTP_HOST"),
    port: parseRequiredPort("BREVO_SMTP_PORT"),
    user: getRequiredEnv("BREVO_SMTP_USER"),
    password: getRequiredEnv("BREVO_SMTP_PASSWORD"),
    fromEmail: getRequiredEnv("SMTP_FROM_EMAIL"),
  },
};
