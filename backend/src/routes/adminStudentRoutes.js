import { Router } from "express";

import {
  createAdminStudent,
  deleteAdminStudent,
  getAdminStudent,
  listAdminStudents,
  updateAdminStudent,
} from "../controllers/adminStudentController.js";

import { authenticate, requireAdmin } from "../middleware/auth.js";

import { validate } from "../middleware/validate.js";

import {
  studentCreateSchema,
  studentIdSchema,
  studentListSchema,
  studentUpdateSchema,
} from "../validators/index.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get(
  "/",
  validate(studentListSchema),
  listAdminStudents
);

router.get(
  "/:id",
  validate(studentIdSchema),
  getAdminStudent
);

router.post(
  "/",
  validate(studentCreateSchema),
  createAdminStudent
);

router.patch(
  "/:id",
  validate(studentUpdateSchema),
  updateAdminStudent
);

router.delete(
  "/:id",
  validate(studentIdSchema),
  deleteAdminStudent
);

export default router;