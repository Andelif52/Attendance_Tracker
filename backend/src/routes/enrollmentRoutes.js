import { Router } from "express";

import {
  enrollStudent,
  getCourseStudents,
  unenrollStudent,
} from "../controllers/enrollmentController.js";

import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.js";

import { validate } from "../middleware/validate.js";

import {
  enrollmentCreateSchema,
  enrollmentDeleteSchema,
  courseIdSchema,
} from "../validators/index.js";


const router = Router();


router.use(authenticate);


/*
=================================
GET COURSE STUDENTS
Teacher/Admin
=================================
*/

router.get(
  "/:course_id/students",
  validate(courseIdSchema),
  getCourseStudents
);



/*
=================================
ENROLL STUDENT
Admin only
=================================
*/

router.post(
  "/:course_id/enroll",
  requireAdmin,
  validate(enrollmentCreateSchema),
  enrollStudent
);



/*
=================================
REMOVE STUDENT FROM COURSE
Admin only
=================================
*/

router.delete(
  "/:course_id/enroll/:student_id",
  requireAdmin,
  validate(enrollmentDeleteSchema),
  unenrollStudent
);


export default router;