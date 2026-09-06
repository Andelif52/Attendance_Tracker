import bcrypt from "bcryptjs";

import { db } from "../config/db.js";

import {
  AppError,
  asyncHandler,
  publicUser,
} from "../utils/helpers.js";

import {
  setAuthCookie,
  clearAuthCookie,
  signToken,
} from "../utils/auth.js";

const TEACHERS_COLLECTION = "teachers";

export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
  } = req.body;

  const normalizedEmail =
    email.trim().toLowerCase();

  const existingSnapshot = await db
    .collection(TEACHERS_COLLECTION)
    .where(
      "email",
      "==",
      normalizedEmail
    )
    .limit(1)
    .get();

  if (!existingSnapshot.empty) {
    throw new AppError(
      "A user with this email already exists.",
      409
    );
  }

  const passwordHash =
    await bcrypt.hash(password, 12);

  const teacherRef = db
    .collection(TEACHERS_COLLECTION)
    .doc();

  const user = {
    name,
    email: normalizedEmail,
    password_hash: passwordHash,
    role: "teacher",
    created_at: new Date(),
  };

  await teacherRef.set(user);

  const token = signToken({
    userId: teacherRef.id,
    role: user.role,
  });

  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    data: {
      user: publicUser(user),
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const {
    email,
    password,
  } = req.body;

  const normalizedEmail =
    email.trim().toLowerCase();

  const snapshot = await db
    .collection(TEACHERS_COLLECTION)
    .where(
      "email",
      "==",
      normalizedEmail
    )
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new AppError(
      "Invalid email or password.",
      401
    );
  }

  const userDoc = snapshot.docs[0];

  const user = {
    id: userDoc.id,
    ...userDoc.data(),
  };

  const matches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!matches) {
    throw new AppError(
      "Invalid email or password.",
      401
    );
  }

  const token = signToken({
    userId: user.id,
    role: user.role,
  });

  setAuthCookie(res, token);

  res.json({
    success: true,
    message: "Logged in successfully.",
    data: {
      user: publicUser(user),
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);

  res.json({
    success: true,
    message: "Logged out successfully.",
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: publicUser(req.user),
    },
  });
});