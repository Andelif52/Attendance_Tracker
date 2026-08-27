export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function publicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    gender: user.gender,
    createdAt: user.createdAt,
  };
}

export function serializeStudent(student) {
  return {
    id: student.id,
    name: student.name,
    varsityId: student.varsityId,
    department: student.department,
    year: student.year,
    semester: student.semester,
    section: student.section,
    createdAt: student.createdAt,
  };
}

export function serializeRecord(record) {
  return {
    recordId: record.id,
    sessionId: record.sessionId,
    studentId: record.studentId,
    name: record.student?.name ?? null,
    varsityId: record.student?.varsityId ?? null,
    department: record.student?.department ?? null,
    year: record.student?.year ?? null,
    semester: record.student?.semester ?? null,
    section: record.student?.section ?? null,
    attendanceStatus: record.attendanceStatus,
    attendedAt: record.attendedAt,
  };
}

export function serializeSession(session, extra = {}) {
  return {
    sessionId: session.id,
    teacherId: session.teacherId,
    teacherName: session.teacher?.name ?? null,
    subject: session.subject,
    year: session.year,
    semester: session.semester,
    section: session.section,
    status: session.status,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    ...extra,
  };
}
