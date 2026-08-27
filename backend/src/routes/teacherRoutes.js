import { Router } from "express";
import { getTeacher, listTeachers } from "../controllers/teacherController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", listTeachers);
router.get("/:id", getTeacher);

export default router;
