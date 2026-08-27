import { Router } from "express";
import {
  addStudentToSession,
  checkIn,
  endSession,
  getSession,
  listSessions,
  startSession,
} from "../controllers/sessionController.js";
import { authenticate, optionalDeviceOrAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  addStudentToSessionSchema,
  checkInSchema,
  sessionIdSchema,
  startSessionSchema,
} from "../validators/index.js";

const router = Router();

router.post(
  "/:id/check-in",
  optionalDeviceOrAuth,
  validate(checkInSchema),
  checkIn
);

router.use(authenticate);

router.get("/", listSessions);
router.post("/", validate(startSessionSchema), startSession);
router.get("/:id", validate(sessionIdSchema), getSession);
router.post("/:id/end", validate(sessionIdSchema), endSession);
router.post(
  "/:id/students",
  validate(addStudentToSessionSchema),
  addStudentToSession
);

export default router;
