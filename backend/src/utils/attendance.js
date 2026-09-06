import { env } from "../config/env.js";

export const AttendanceStatus = {
  ABSENT: "ABSENT",
  PRESENT: "PRESENT",
  LATE: "LATE",
};

export function resolveAttendanceStatus(
  sessionStartedAt,
  checkInAt = new Date()
) {
  const graceMs = env.lateGraceMinutes * 60 * 1000;

  const elapsed =
    checkInAt.getTime() -
    new Date(sessionStartedAt).getTime();

  if (elapsed > graceMs) {
    return AttendanceStatus.LATE;
  }

  return AttendanceStatus.PRESENT;
}