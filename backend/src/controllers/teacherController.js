import bcrypt from "bcryptjs";

import { db } from "../config/db.js";

import {
  AppError,
  asyncHandler,
  publicUser,
} from "../utils/helpers.js";

const TEACHERS_COLLECTION = "teachers";

function normalizeTeacher(id, data) {
  return {
    id,
    ...data,
  };
}

export const listTeachers = asyncHandler(async (req, res) => {
  const snapshot = await db
    .collection(TEACHERS_COLLECTION)
    .where("role", "==", "teacher")
    .get();

  const teachers = snapshot.docs
    .map((doc) =>
      normalizeTeacher(
        doc.id,
        doc.data()
      )
    )
    .sort((a, b) =>
      a.name.localeCompare(b.name)
    );

  res.json({
    success: true,
    data: {
      teachers: teachers.map(publicUser),
      count: teachers.length,
    },
  });
});

export const getTeacher = asyncHandler(async (req, res) => {
  const teacherDoc = await db
    .collection(TEACHERS_COLLECTION)
    .doc(req.params.id)
    .get();

  if (!teacherDoc.exists) {
    throw new AppError(
      "Teacher not found.",
      404
    );
  }

  const teacher = normalizeTeacher(
    teacherDoc.id,
    teacherDoc.data()
  );

  if (teacher.role !== "teacher") {
    throw new AppError(
      "Teacher not found.",
      404
    );
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

  const teacher = {
    name,
    email: normalizedEmail,
    password_hash: passwordHash,
    role: "teacher",
    created_at: new Date(),
  };

  await teacherRef.set(teacher);

  res.status(201).json({
    success: true,
    message: "Teacher created successfully.",
    data: {
      teacher: publicUser(teacher),
    },
  });
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const teacherRef = db
    .collection(TEACHERS_COLLECTION)
    .doc(req.params.id);

  const existingDoc =
    await teacherRef.get();

  if (!existingDoc.exists) {
    throw new AppError(
      "Teacher not found.",
      404
    );
  }

  const existing = normalizeTeacher(
    existingDoc.id,
    existingDoc.data()
  );

  if (existing.role !== "teacher") {
    throw new AppError(
      "Teacher not found.",
      404
    );
  }

  const {
    name,
    email,
    password,
  } = req.body;

  const data = {
    role: "teacher",
  };

  if (name !== undefined) {
    data.name = name;
  }

  if (email !== undefined) {
    data.email =
      email.trim().toLowerCase();
  }

  if (password !== undefined) {
    data.password_hash =
      await bcrypt.hash(password, 12);
  }

  if (data.email) {
    const duplicateSnapshot = await db
      .collection(TEACHERS_COLLECTION)
      .where(
        "email",
        "==",
        data.email
      )
      .limit(1)
      .get();

    if (
      !duplicateSnapshot.empty &&
      duplicateSnapshot.docs[0].id !== req.params.id
    ) {
      throw new AppError(
        "A user with this email already exists.",
        409
      );
    }
  }

  await teacherRef.update(data);

  const updatedDoc =
    await teacherRef.get();

  const teacher = normalizeTeacher(
    updatedDoc.id,
    updatedDoc.data()
  );

  res.json({
    success: true,
    message: "Teacher updated successfully.",
    data: {
      teacher: publicUser(teacher),
    },
  });
});

export const deleteTeacher = asyncHandler(async (req, res) => {
  const teacherRef = db
    .collection(TEACHERS_COLLECTION)
    .doc(req.params.id);

  const teacherDoc =
    await teacherRef.get();

  if (!teacherDoc.exists) {
    throw new AppError(
      "Teacher not found.",
      404
    );
  }

  const teacher = normalizeTeacher(
    teacherDoc.id,
    teacherDoc.data()
  );

  if (teacher.role !== "teacher") {
    throw new AppError(
      "Teacher not found.",
      404
    );
  }

  const sessionsSnapshot = await db
    .collection("sessions")
    .where(
      "teacherId",
      "==",
      req.params.id
    )
    .limit(1)
    .get();

  if (!sessionsSnapshot.empty) {
    throw new AppError(
      "This teacher has sessions and cannot be deleted.",
      409
    );
  }

  await teacherRef.delete();

  res.json({
    success: true,
    message: "Teacher deleted successfully.",
  });
});