import { db } from "../config/db.js";

import {
  AppError,
  asyncHandler,
  serializeCourse,
} from "../utils/helpers.js";


const COURSES_COLLECTION = "courses";
const ENROLLMENTS_COLLECTION = "enrollments";


function normalizeCourse(id, data) {
  return {
    id,
    ...data,
  };
}


/*
=================================
LIST COURSES
Teacher/Admin
=================================
*/

export const listCourses = asyncHandler(async (req, res) => {
  const {
    teacher_id,
    department,
  } = req.query;


  let query = db.collection(COURSES_COLLECTION);


  if (teacher_id) {
    query = query.where(
      "teacher_id",
      "==",
      teacher_id
    );
  }


  if (department) {
    query = query.where(
      "department",
      "==",
      department
    );
  }


  const snapshot = await query.get();


  const courses = snapshot.docs
    .map((doc) =>
      normalizeCourse(
        doc.id,
        doc.data()
      )
    );


  res.json({
    success: true,
    data: {
      courses: courses.map(serializeCourse),
      count: courses.length,
    },
  });
});



/*
=================================
GET SINGLE COURSE
Teacher/Admin
=================================
*/

export const getCourse = asyncHandler(async (req, res) => {

  const courseDoc = await db
    .collection(COURSES_COLLECTION)
    .doc(req.params.id)
    .get();


  if (!courseDoc.exists) {
    throw new AppError(
      "Course not found.",
      404
    );
  }


  const course = normalizeCourse(
    courseDoc.id,
    courseDoc.data()
  );


  res.json({
    success: true,
    data: {
      course: serializeCourse(course),
    },
  });

});



/*
=================================
CREATE COURSE
Admin only
=================================
*/

export const createCourse = asyncHandler(async (req, res) => {

  const {
    course_code,
    course_name,
    department,
    section,
    teacher_id,
  } = req.body;



  const existingSnapshot = await db
    .collection(COURSES_COLLECTION)
    .where(
      "course_code",
      "==",
      course_code
    )
    .where(
      "section",
      "==",
      section
    )
    .limit(1)
    .get();



  if (!existingSnapshot.empty) {
    throw new AppError(
      "A course with this code and section already exists.",
      409
    );
  }



  const courseData = {
    course_code,
    course_name,
    department,
    section,
    teacher_id,
    total_classes: 0,
    created_at: new Date(),
  };



  const courseRef = db
    .collection(COURSES_COLLECTION)
    .doc();



  await courseRef.set(courseData);



  const course = {
    id: courseRef.id,
    ...courseData,
  };



  res.status(201).json({
    success: true,
    message: "Course created successfully.",
    data: {
      course: serializeCourse(course),
    },
  });

});



/*
=================================
UPDATE COURSE
Admin only
=================================
*/

export const updateCourse = asyncHandler(async (req, res) => {

  const courseRef = db
    .collection(COURSES_COLLECTION)
    .doc(req.params.id);



  const existingDoc =
    await courseRef.get();



  if (!existingDoc.exists) {
    throw new AppError(
      "Course not found.",
      404
    );
  }



  const updateData = {};



  const allowedFields = [
    "course_name",
    "department",
    "section",
    "teacher_id",
  ];



  allowedFields.forEach((field) => {

    if (req.body[field] !== undefined) {
      updateData[field] =
        req.body[field];
    }

  });



  if (
    Object.keys(updateData).length === 0
  ) {
    throw new AppError(
      "No valid fields provided.",
      400
    );
  }



  await courseRef.update(updateData);



  const updatedDoc =
    await courseRef.get();



  const course = normalizeCourse(
    updatedDoc.id,
    updatedDoc.data()
  );



  res.json({
    success: true,
    message: "Course updated successfully.",
    data: {
      course: serializeCourse(course),
    },
  });

});



/*
=================================
DELETE COURSE
Admin only
=================================
*/

export const deleteCourse = asyncHandler(async (req, res) => {

  const courseRef = db
    .collection(COURSES_COLLECTION)
    .doc(req.params.id);



  const existingDoc =
    await courseRef.get();



  if (!existingDoc.exists) {
    throw new AppError(
      "Course not found.",
      404
    );
  }



  const enrollments =
    await db
      .collection(ENROLLMENTS_COLLECTION)
      .where(
        "course_id",
        "==",
        req.params.id
      )
      .get();



  for (const doc of enrollments.docs) {
    await doc.ref.delete();
  }



  await courseRef.delete();



  res.json({
    success: true,
    message: "Course deleted successfully.",
  });

});