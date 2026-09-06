import { db } from "../config/db.js";

import {
  AppError,
  asyncHandler,
  serializeStudent,
} from "../utils/helpers.js";

const STUDENTS_COLLECTION = "students";

function normalizeStudent(id, data) {
  return {
    id,
    ...data,
  };
}

export const listStudents = asyncHandler(async (req, res) => {
  const {
    department,
    search,
  } = req.query;

  let query = db.collection(STUDENTS_COLLECTION);

  if (department) {
    query = query.where(
      "department",
      "==",
      department
    );
  }

  const snapshot = await query.get();

  let students = snapshot.docs.map((doc) =>
    normalizeStudent(
      doc.id,
      doc.data()
    )
  );

  if (search) {
    const searchValue =
      search.toLowerCase();

    students = students.filter(
      (student) =>
        student.name
          ?.toLowerCase()
          .includes(searchValue) ||
        student.student_id
          ?.toLowerCase()
          .includes(searchValue) ||
        student.email
          ?.toLowerCase()
          .includes(searchValue)
    );
  }

  students.sort((a, b) =>
    (a.name || "").localeCompare(
      b.name || ""
    )
  );

  res.json({
    success: true,
    data: {
      students: students.map(serializeStudent),
      count: students.length,
    },
  });
});

export const getStudent = asyncHandler(async (req, res) => {
  const studentDoc = await db
    .collection(STUDENTS_COLLECTION)
    .doc(req.params.id)
    .get();

  if (!studentDoc.exists) {
    throw new AppError(
      "Student not found.",
      404
    );
  }

  const student = normalizeStudent(
    studentDoc.id,
    studentDoc.data()
  );

  res.json({
    success: true,
    data: {
      student: serializeStudent(student),
    },
  });
});

export const createStudent = asyncHandler(async (req, res) => {
  const studentId = req.body.id;

  const studentRef = db
    .collection(STUDENTS_COLLECTION)
    .doc(studentId);

  const existingStudent =
    await studentRef.get();

  if (existingStudent.exists) {
    throw new AppError(
      "A student with this ID already exists.",
      409
    );
  }

  const studentData = {
    student_id: studentId,
    name: req.body.name,
    department: req.body.department,
    batch: req.body.batch ?? null,
    email: req.body.email ?? null,
    face_enrolled:
      req.body.face_enrolled ?? false,
    is_active:
      req.body.is_active ?? true,
    created_at: new Date(),
  };

  await studentRef.set(studentData);

  const student = {
    id: studentId,
    ...studentData,
  };

  res.status(201).json({
    success: true,
    message: "Student created.",
    data: {
      student: serializeStudent(student),
    },
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const studentRef = db
    .collection(STUDENTS_COLLECTION)
    .doc(req.params.id);

  const existing =
    await studentRef.get();

  if (!existing.exists) {
    throw new AppError(
      "Student not found.",
      404
    );
  }

  const updateData = {};

  if (req.body.name !== undefined) {
    updateData.name = req.body.name;
  }

  if (req.body.department !== undefined) {
    updateData.department =
      req.body.department;
  }

  if (req.body.batch !== undefined) {
    updateData.batch =
      req.body.batch;
  }

  if (req.body.email !== undefined) {
    updateData.email =
      req.body.email;
  }

  if (req.body.face_enrolled !== undefined) {
    updateData.face_enrolled =
      req.body.face_enrolled;
  }

  if (req.body.is_active !== undefined) {
    updateData.is_active =
      req.body.is_active;
  }

  await studentRef.update(updateData);

  const updatedDoc =
    await studentRef.get();

  const student = normalizeStudent(
    updatedDoc.id,
    updatedDoc.data()
  );

  res.json({
    success: true,
    message: "Student updated.",
    data: {
      student: serializeStudent(student),
    },
  });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const studentRef = db
    .collection(STUDENTS_COLLECTION)
    .doc(req.params.id);

  const existing =
    await studentRef.get();

  if (!existing.exists) {
    throw new AppError(
      "Student not found.",
      404
    );
  }

  const recordsSnapshot = await db
    .collection("attendance_records")
    .where(
      "studentId",
      "==",
      req.params.id
    )
    .limit(1)
    .get();

  if (!recordsSnapshot.empty) {
    throw new AppError(
      "This student has attendance records and cannot be deleted.",
      409
    );
  }

  await studentRef.delete();

  res.json({
    success: true,
    message: "Student deleted.",
  });
});