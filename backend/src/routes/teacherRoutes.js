import { Router } from "express";

import {
  createTeacher,
  deleteTeacher,
  getTeacher,
  listTeachers,
  updateTeacher,
} from "../controllers/teacherController.js";

import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.js";

import { validate } from "../middleware/validate.js";

import {
  teacherCreateSchema,
  teacherIdSchema,
  teacherUpdateSchema,
} from "../validators/index.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get(
  "/",
  listTeachers
);

router.get(
  "/:id",
  validate(teacherIdSchema),
  getTeacher
);

router.post(
  "/",
  validate(teacherCreateSchema),
  createTeacher
);

router.patch(
  "/:id",
  validate(teacherUpdateSchema),
  updateTeacher
);

router.delete(
  "/:id",
  validate(teacherIdSchema),
  deleteTeacher
);

export default router;