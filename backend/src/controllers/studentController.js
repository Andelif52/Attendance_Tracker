import { prisma } from "../config/db.js";
import {
  AppError,
  asyncHandler,
  serializeStudent,
} from "../utils/helpers.js";

export const listStudents = asyncHandler(async (req, res) => {
  const { year, semester, section, department, search } = req.query;

  const students = await prisma.student.findMany({
    where: {
      ...(year ? { year: Number(year) } : {}),
      ...(semester ? { semester: Number(semester) } : {}),
      ...(section ? { section } : {}),
      ...(department ? { department } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { varsityId: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: [{ year: "asc" }, { section: "asc" }, { name: "asc" }],
  });

  res.json({
    success: true,
    data: { students: students.map(serializeStudent), count: students.length },
  });
});

export const getStudent = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!student) {
    throw new AppError("Student not found.", 404);
  }

  res.json({
    success: true,
    data: { student: serializeStudent(student) },
  });
});

export const createStudent = asyncHandler(async (req, res) => {
  const student = await prisma.student.create({
    data: {
      name: req.body.name,
      varsityId: req.body.varsityId,
      department: req.body.department,
      year: req.body.year,
      semester: req.body.semester,
      section: req.body.section.toUpperCase(),
    },
  });

  res.status(201).json({
    success: true,
    message: "Student created.",
    data: { student: serializeStudent(student) },
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.student.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError("Student not found.", 404);
  }

  const student = await prisma.student.update({
    where: { id },
    data: {
      ...req.body,
      ...(req.body.section ? { section: req.body.section.toUpperCase() } : {}),
    },
  });

  res.json({
    success: true,
    message: "Student updated.",
    data: { student: serializeStudent(student) },
  });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.student.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError("Student not found.", 404);
  }

  try {
    await prisma.student.delete({ where: { id } });
  } catch (error) {
    if (error.code === "P2003") {
      throw new AppError(
        "This student has attendance records and cannot be deleted.",
        409
      );
    }
    throw error;
  }

  res.json({
    success: true,
    message: "Student deleted.",
  });
});
