import express from "express";

import cors from "cors";

import cookieParser from "cookie-parser";

import helmet from "helmet";

import morgan from "morgan";

import { env } from "./config/env.js";


import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";

import studentRoutes from "./routes/studentRoutes.js";

import adminStudentRoutes from "./routes/adminStudentRoutes.js";

import sessionRoutes from "./routes/sessionRoutes.js";

import teacherRoutes from "./routes/teacherRoutes.js";

import courseRoutes from "./routes/courseRoutes.js";

import enrollmentRoutes from "./routes/enrollmentRoutes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);

app.use(
  morgan(
    env.nodeEnv === "production"
      ? "combined"
      : "dev"
  )
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "IoT Attendance API is running.",
  });
});

/* =========================
   AUTHENTICATION
========================= */

app.use(
  "/api/auth",
  authRoutes
);

/* =========================
   STUDENTS
========================= */

// Existing student functionality
app.use(
  "/api/students",
  studentRoutes
);

// Admin-only student management
app.use(
  "/api/admin/students",
  adminStudentRoutes
);

/* =========================
   SESSIONS
========================= */

app.use(
  "/api/sessions",
  sessionRoutes
);

/* =========================
   TEACHERS
========================= */

// Admin-only teacher management
app.use(
  "/api/teachers",
  teacherRoutes
);

/* =========================
   COURSES
========================= */

app.use(
  "/api/courses",
  courseRoutes
);



/* =========================
   ENROLLMENTS
========================= */

app.use(
  "/api/courses",
  enrollmentRoutes
);


app.use(notFoundHandler);

app.use(errorHandler);

export default app;