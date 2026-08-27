import { Router } from "express";
import {
  createStudent,
  deleteStudent,
  getStudent,
  listStudents,
  updateStudent,
} from "../controllers/studentController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  studentCreateSchema,
  studentIdSchema,
  studentListSchema,
  studentUpdateSchema,
} from "../validators/index.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(studentListSchema), listStudents);
router.get("/:id", validate(studentIdSchema), getStudent);
router.post("/", validate(studentCreateSchema), createStudent);
router.patch("/:id", validate(studentUpdateSchema), updateStudent);
router.delete("/:id", validate(studentIdSchema), deleteStudent);

export default router;
