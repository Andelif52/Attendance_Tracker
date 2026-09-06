import bcrypt from "bcryptjs";

import { prisma } from "../config/db.js";

import {
  AppError,
  asyncHandler,
  publicUser,
} from "../utils/helpers.js";

export const listTeachers = asyncHandler(async (req, res) => {
  const teachers = await prisma.user.findMany({
    where: {
      role: "TEACHER",
    },

    orderBy: {
      name: "asc",
    },
  });

  res.json({
    success: true,
    data: {
      teachers: teachers.map(publicUser),
      count: teachers.length,
    },
  });
});

export const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await prisma.user.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });

  if (!teacher || teacher.role !== "TEACHER") {
    throw new AppError("Teacher not found.", 404);
  }

  res.json({
    success: true,
    data: {
      teacher: publicUser(teacher),
    },
  });
});

export const createTeacher = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    department,
    gender,
  } = req.body;

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existing) {
    throw new AppError(
      "A user with this email already exists.",
      409
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const teacher = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      department,
      gender,

      // Teacher creation through the Admin Panel
      // can NEVER create an admin.
      role: "TEACHER",
    },
  });

  res.status(201).json({
    success: true,
    message: "Teacher created successfully.",
    data: {
      teacher: publicUser(teacher),
    },
  });
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing || existing.role !== "TEACHER") {
    throw new AppError("Teacher not found.", 404);
  }

  const {
    name,
    email,
    password,
    department,
    gender,
  } = req.body;

  const data = {};

  if (name !== undefined) {
    data.name = name;
  }

  if (email !== undefined) {
    data.email = email.trim().toLowerCase();
  }

  if (department !== undefined) {
    data.department = department;
  }

  if (gender !== undefined) {
    data.gender = gender;
  }

  if (password !== undefined) {
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  // Never allow the role to be changed through this endpoint.
  // The account must remain a TEACHER.
  data.role = "TEACHER";

  try {
    const teacher = await prisma.user.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: "Teacher updated successfully.",
      data: {
        teacher: publicUser(teacher),
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new AppError(
        "A user with this email already exists.",
        409
      );
    }

    throw error;
  }
});

export const deleteTeacher = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const teacher = await prisma.user.findUnique({
    where: { id },
  });

  if (!teacher || teacher.role !== "TEACHER") {
    throw new AppError("Teacher not found.", 404);
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new AppError(
        "This teacher has sessions and cannot be deleted.",
        409
      );
    }

    throw error;
  }

  res.json({
    success: true,
    message: "Teacher deleted successfully.",
  });
});