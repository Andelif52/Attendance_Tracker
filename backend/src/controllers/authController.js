import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { AppError, asyncHandler, publicUser } from "../utils/helpers.js";
import { setAuthCookie, clearAuthCookie, signToken } from "../utils/auth.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, department, gender } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("A user with this email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      department,
      gender,
      role: "TEACHER",
    },
  });

  const token = signToken({ userId: user.id, role: user.role });
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    data: { user: publicUser(user) },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = signToken({ userId: user.id, role: user.role });
  setAuthCookie(res, token);

  res.json({
    success: true,
    message: "Logged in successfully.",
    data: { user: publicUser(user) },
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
    data: { user: publicUser(req.user) },
  });
});
