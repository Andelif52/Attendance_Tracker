import { env } from "../config/env.js";
import { AttendanceStatus } from "@prisma/client";

export function resolveAttendanceStatus(sessionStartedAt, checkInAt = new Date()) {
  const graceMs = env.lateGraceMinutes * 60 * 1000;
  const elapsed = checkInAt.getTime() - new Date(sessionStartedAt).getTime();

  if (elapsed > graceMs) {
    return AttendanceStatus.LATE;
  }

  return AttendanceStatus.PRESENT;
}
