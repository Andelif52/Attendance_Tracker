import { prisma } from "../config/db.js";
import { AppError, asyncHandler, publicUser } from "../utils/helpers.js";

export const listTeachers = asyncHandler(async (req, res) => {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { name: "asc" },
  });

  res.json({
    success: true,
    data: { teachers: teachers.map(publicUser) },
  });
});

export const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!teacher || teacher.role !== "TEACHER") {
    throw new AppError("Teacher not found.", 404);
  }

  res.json({
    success: true,
    data: { teacher: publicUser(teacher) },
  });
});
