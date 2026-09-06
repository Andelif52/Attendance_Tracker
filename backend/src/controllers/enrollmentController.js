import { db } from "../config/db.js";

import {
  AppError,
  asyncHandler,
} from "../utils/helpers.js";


const COURSES_COLLECTION = "courses";
const STUDENTS_COLLECTION = "students";
const ENROLLMENTS_COLLECTION = "enrollments";


function normalizeEnrollment(id, data) {
  return {
    id,
    ...data,
  };
}


/*
=================================
ENROLL STUDENT INTO COURSE
Admin only
=================================
*/

export const enrollStudent = asyncHandler(async (req, res) => {

  const {
    student_id,
  } = req.body;


  const courseId = req.params.course_id;


  // Check course exists

  const courseDoc = await db
    .collection(COURSES_COLLECTION)
    .doc(courseId)
    .get();


  if (!courseDoc.exists) {
    throw new AppError(
      "Course not found.",
      404
    );
  }


  // Check student exists

  const studentDoc = await db
    .collection(STUDENTS_COLLECTION)
    .doc(student_id)
    .get();


  if (!studentDoc.exists) {
    throw new AppError(
      "Student not found.",
      404
    );
  }


  // Check duplicate enrollment

  const existingEnrollment = await db
    .collection(ENROLLMENTS_COLLECTION)
    .where(
      "student_id",
      "==",
      student_id
    )
    .where(
      "course_id",
      "==",
      courseId
    )
    .limit(1)
    .get();


  if (!existingEnrollment.empty) {
    throw new AppError(
      "Student is already enrolled in this course.",
      409
    );
  }


  const enrollmentData = {
    student_id,
    course_id: courseId,
    enrolled_at: new Date(),
  };


  const enrollmentRef = db
    .collection(ENROLLMENTS_COLLECTION)
    .doc();


  await enrollmentRef.set(enrollmentData);


  const enrollment = {
    id: enrollmentRef.id,
    ...enrollmentData,
  };


  res.status(201).json({
    success: true,
    message: "Student enrolled successfully.",
    data: {
      enrollment: {
        enrollment_id: enrollment.id,
        student_id: enrollment.student_id,
        course_id: enrollment.course_id,
        enrolled_at: enrollment.enrolled_at,
      },
    },
  });

});



/*
=================================
GET STUDENTS OF COURSE
Teacher/Admin
=================================
*/

export const getCourseStudents = asyncHandler(async (req, res) => {

  const courseId = req.params.course_id;


  // Verify course exists

  const courseDoc = await db
    .collection(COURSES_COLLECTION)
    .doc(courseId)
    .get();


  if (!courseDoc.exists) {
    throw new AppError(
      "Course not found.",
      404
    );
  }


  const enrollmentSnapshot = await db
    .collection(ENROLLMENTS_COLLECTION)
    .where(
      "course_id",
      "==",
      courseId
    )
    .get();


  const students = [];


  for (const doc of enrollmentSnapshot.docs) {

    const enrollment =
      normalizeEnrollment(
        doc.id,
        doc.data()
      );


    const studentDoc = await db
      .collection(STUDENTS_COLLECTION)
      .doc(enrollment.student_id)
      .get();


    if (studentDoc.exists) {

      const student =
        studentDoc.data();


      students.push({
        student_id:
          enrollment.student_id,

        name:
          student.name ?? null,

        department:
          student.department ?? null,

        batch:
          student.batch ?? null,

        email:
          student.email ?? null,
      });

    }

  }


  res.json({
    success: true,
    data: {
      students,
      count: students.length,
    },
  });

});



/*
=================================
REMOVE STUDENT FROM COURSE
Admin only
=================================
*/

export const unenrollStudent = asyncHandler(async (req, res) => {

  const {
    course_id,
    student_id,
  } = req.params;


  const enrollmentSnapshot = await db
    .collection(ENROLLMENTS_COLLECTION)
    .where(
      "course_id",
      "==",
      course_id
    )
    .where(
      "student_id",
      "==",
      student_id
    )
    .limit(1)
    .get();


  if (enrollmentSnapshot.empty) {
    throw new AppError(
      "Enrollment not found.",
      404
    );
  }


  await enrollmentSnapshot.docs[0]
    .ref
    .delete();


  res.json({
    success: true,
    message:
      "Student removed from course successfully.",
  });

});