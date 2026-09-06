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

function serializeDate(value) {
  if (!value) return null;

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  return value;
}

export function publicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: serializeDate(user.created_at),
  };
}

export function serializeStudent(student) {
  return {
    student_id: student.student_id ?? student.id,
    name: student.name,
    department: student.department,
    batch: student.batch ?? null,
    email: student.email ?? null,
    face_enrolled: student.face_enrolled ?? false,
    is_active: student.is_active ?? true,
    created_at: serializeDate(student.created_at),
  };
}

export function serializeCourse(course) {
  return {
    course_id: course.id ?? course.course_id,
    course_code: course.course_code,
    course_name: course.course_name,
    department: course.department,
    section: course.section,
    teacher_id: course.teacher_id,
    total_classes: course.total_classes ?? 0,
    created_at: serializeDate(course.created_at),
  };
}

export function serializeRecord(record) {
  return {
    recordId: record.id,
    sessionId: record.sessionId,
    studentId: record.studentId,
    name: record.student?.name ?? null,
    student_id:
      record.student?.student_id ??
      record.student?.id ??
      null,
    department:
      record.student?.department ??
      null,
    batch:
      record.student?.batch ??
      null,
    attendanceStatus: record.attendanceStatus,
    attendedAt: serializeDate(record.attendedAt),
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
    startedAt: serializeDate(session.startedAt),
    endedAt: serializeDate(session.endedAt),
    ...extra,
  };
}