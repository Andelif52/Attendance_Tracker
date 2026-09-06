import { Router } from "express";


import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";


import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.js";


import { validate } from "../middleware/validate.js";


import {
  courseCreateSchema,
  courseUpdateSchema,
  courseIdSchema,
  courseListSchema,
} from "../validators/index.js";



const router = Router();



router.use(authenticate);



router.get(
  "/",
  validate(courseListSchema),
  listCourses
);



router.get(
  "/:id",
  validate(courseIdSchema),
  getCourse
);



router.post(
  "/",
  requireAdmin,
  validate(courseCreateSchema),
  createCourse
);



router.patch(
  "/:id",
  requireAdmin,
  validate(courseUpdateSchema),
  updateCourse
);



router.delete(
  "/:id",
  requireAdmin,
  validate(courseIdSchema),
  deleteCourse
);



export default router;