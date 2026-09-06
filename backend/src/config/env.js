import dotenv from "dotenv";

dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;

  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(
    process.env.PORT || process.env.API_PORT || 5000
  ),

  jwtSecret: required(
    "JWT_SECRET",
    process.env.JWT_SECRET_KEY ||
      "dev-iot-attendance-jwt-secret-change-in-production"
  ),

  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN ||
    "7d",

  clientOrigin:
    process.env.CLIENT_ORIGIN ||
    "http://localhost:5173",

  cookieName:
    process.env.COOKIE_NAME ||
    "attendance_token",

  lateGraceMinutes:
    Number(
      process.env.LATE_GRACE_MINUTES ||
      process.env.LATE_THRESHOLD_MINUTES ||
      15
    ),

  deviceApiKey:
    process.env.DEVICE_API_KEY ||
    "dev-raspberry-pi-key",

  firebase: {
    projectId: required(
      "FIREBASE_PROJECT_ID"
    ),

    credentialsPath: required(
      "FIREBASE_CREDENTIALS_PATH",
      "./firebase-credentials.json"
    ),
  },

  admin: {
    email:
      process.env.ADMIN_EMAIL ||
      "admin@iot-attendance.local",

    password:
      process.env.ADMIN_PASSWORD ||
      "Admin@12345",

    name:
      process.env.ADMIN_NAME ||
      "System Admin",
  },
};