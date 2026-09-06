import { db } from "../config/db.js";
import {
  AttendanceStatus,
  resolveAttendanceStatus,
} from "../utils/attendance.js";

import {
  AppError,
  asyncHandler,
  serializeRecord,
  serializeSession,
} from "../utils/helpers.js";

const SESSIONS_COLLECTION = "sessions";
const RECORDS_COLLECTION = "attendance_records";
const STUDENTS_COLLECTION = "students";
const TEACHERS_COLLECTION = "teachers";

const SessionStatus = {
  RUNNING: "RUNNING",
  ENDED: "ENDED",
};

function normalizeDocument(id, data) {
  return {
    id,
    ...data,
  };
}

async function getTeacher(teacherId) {
  if (!teacherId) return null;

  const teacherDoc = await db
    .collection(TEACHERS_COLLECTION)
    .doc(teacherId)
    .get();

  if (!teacherDoc.exists) {
    return null;
  }

  return normalizeDocument(
    teacherDoc.id,
    teacherDoc.data()
  );
}

async function getRecordWithStudent(recordDoc) {
  const record = normalizeDocument(
    recordDoc.id,
    recordDoc.data()
  );

  const studentDoc = await db
    .collection(STUDENTS_COLLECTION)
    .doc(record.studentId)
    .get();

  const student = studentDoc.exists
    ? normalizeDocument(
        studentDoc.id,
        studentDoc.data()
      )
    : null;

  return {
    ...record,
    student,
  };
}

async function getSessionWithRelations(sessionId) {
  const sessionDoc = await db
    .collection(SESSIONS_COLLECTION)
    .doc(sessionId)
    .get();

  if (!sessionDoc.exists) {
    return null;
  }

  const session = normalizeDocument(
    sessionDoc.id,
    sessionDoc.data()
  );

  const teacher = await getTeacher(
    session.teacherId
  );

  const recordsSnapshot = await db
    .collection(RECORDS_COLLECTION)
    .where(
      "sessionId",
      "==",
      session.id
    )
    .get();

  const records = await Promise.all(
    recordsSnapshot.docs.map((doc) =>
      getRecordWithStudent(doc)
    )
  );

  records.sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  return {
    ...session,
    teacher,
    records,
  };
}

async function getAccessibleSession(sessionId, user) {
  const session =
    await getSessionWithRelations(sessionId);

  if (!session) {
    throw new AppError(
      "Session not found.",
      404
    );
  }

  if (
    user &&
    user.role !== "ADMIN" &&
    session.teacherId !== user.id
  ) {
    throw new AppError(
      "You cannot access this session.",
      403
    );
  }

  return session;
}

export const startSession = asyncHandler(async (req, res) => {
  const {
    subject,
    year,
    semester,
    section,
  } = req.body;

  const normalizedSection =
    section.toUpperCase();

  const runningSnapshot = await db
    .collection(SESSIONS_COLLECTION)
    .where(
      "teacherId",
      "==",
      req.user.id
    )
    .where(
      "status",
      "==",
      SessionStatus.RUNNING
    )
    .limit(1)
    .get();

  if (!runningSnapshot.empty) {
    throw new AppError(
      "You already have a running session. End it before starting another.",
      409
    );
  }

  const studentsSnapshot = await db
    .collection(STUDENTS_COLLECTION)
    .where(
      "year",
      "==",
      year
    )
    .where(
      "semester",
      "==",
      semester
    )
    .where(
      "section",
      "==",
      normalizedSection
    )
    .get();

  const sessionRef = db
    .collection(SESSIONS_COLLECTION)
    .doc();

  const startedAt = new Date();

  const sessionData = {
    teacherId: req.user.id,
    subject,
    year,
    semester,
    section: normalizedSection,
    status: SessionStatus.RUNNING,
    startedAt,
    endedAt: null,
    createdAt: startedAt,
    updatedAt: startedAt,
  };

  const batch = db.batch();

  batch.set(
    sessionRef,
    sessionData
  );

  studentsSnapshot.docs.forEach((studentDoc) => {
    const recordRef = db
      .collection(RECORDS_COLLECTION)
      .doc();

    batch.set(recordRef, {
      sessionId: sessionRef.id,
      studentId: studentDoc.id,
      attendanceStatus:
        AttendanceStatus.ABSENT,
      attendedAt: null,
      createdAt: startedAt,
      updatedAt: startedAt,
    });
  });

  await batch.commit();

  const session =
    await getSessionWithRelations(
      sessionRef.id
    );

  res.status(201).json({
    success: true,
    message: "Session started.",
    data: {
      session: serializeSession(
        session,
        {
          recordCount:
            session.records.length,
          records:
            session.records.map(
              serializeRecord
            ),
        }
      ),
    },
  });
});

export const listSessions = asyncHandler(async (req, res) => {
  let query =
    db.collection(SESSIONS_COLLECTION);

  if (req.user.role !== "ADMIN") {
    query = query.where(
      "teacherId",
      "==",
      req.user.id
    );
  }

  const snapshot =
    await query.get();

  const sessions = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const session =
        await getSessionWithRelations(
          doc.id
        );

      return serializeSession(
        session,
        {
          recordCount:
            session.records.length,
        }
      );
    })
  );

  sessions.sort((a, b) =>
    new Date(b.startedAt) -
    new Date(a.startedAt)
  );

  res.json({
    success: true,
    data: {
      sessions,
    },
  });
});

export const getSession = asyncHandler(async (req, res) => {
  const session =
    await getAccessibleSession(
      req.params.id,
      req.user
    );

  res.json({
    success: true,
    data: {
      session: serializeSession(
        session,
        {
          records:
            session.records.map(
              serializeRecord
            ),
        }
      ),
    },
  });
});

export const endSession = asyncHandler(async (req, res) => {
  const session =
    await getAccessibleSession(
      req.params.id,
      req.user
    );

  if (
    session.status ===
    SessionStatus.ENDED
  ) {
    throw new AppError(
      "This session has already ended.",
      400
    );
  }

  await db
    .collection(SESSIONS_COLLECTION)
    .doc(req.params.id)
    .update({
      status: SessionStatus.ENDED,
      endedAt: new Date(),
      updatedAt: new Date(),
    });

  const updated =
    await getSessionWithRelations(
      req.params.id
    );

  res.json({
    success: true,
    message: "Session ended.",
    data: {
      session: serializeSession(
        updated,
        {
          records:
            updated.records.map(
              serializeRecord
            ),
        }
      ),
    },
  });
});

export const addStudentToSession = asyncHandler(async (req, res) => {
  const session =
    await getAccessibleSession(
      req.params.id,
      req.user
    );

  if (
    session.status !==
    SessionStatus.RUNNING
  ) {
    throw new AppError(
      "Students can only be added to a running session.",
      400
    );
  }

  const studentSnapshot = await db
    .collection(STUDENTS_COLLECTION)
    .where(
      "varsityId",
      "==",
      req.body.varsityId.trim()
    )
    .limit(1)
    .get();

  if (studentSnapshot.empty) {
    throw new AppError(
      "No student found with that varsity ID.",
      404
    );
  }

  const studentDoc =
    studentSnapshot.docs[0];

  const existingSnapshot = await db
    .collection(RECORDS_COLLECTION)
    .where(
      "sessionId",
      "==",
      session.id
    )
    .where(
      "studentId",
      "==",
      studentDoc.id
    )
    .limit(1)
    .get();

  if (!existingSnapshot.empty) {
    throw new AppError(
      "This student is already in the session.",
      409
    );
  }

  const recordRef = db
    .collection(RECORDS_COLLECTION)
    .doc();

  const record = {
    id: recordRef.id,
    sessionId: session.id,
    studentId: studentDoc.id,
    attendanceStatus:
      AttendanceStatus.ABSENT,
    attendedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    student: normalizeDocument(
      studentDoc.id,
      studentDoc.data()
    ),
  };

  await recordRef.set(record);

  res.status(201).json({
    success: true,
    message: "Student added to the session.",
    data: {
      record: serializeRecord(record),
    },
  });
});

export const checkIn = asyncHandler(async (req, res) => {
  const session =
    await getSessionWithRelations(
      req.params.id
    );

  if (!session) {
    throw new AppError(
      "Session not found.",
      404
    );
  }

  if (
    !req.isDevice &&
    req.user &&
    req.user.role !== "ADMIN" &&
    session.teacherId !== req.user.id
  ) {
    throw new AppError(
      "You cannot update this session.",
      403
    );
  }

  if (
    session.status !==
    SessionStatus.RUNNING
  ) {
    throw new AppError(
      "Attendance can only be marked on a running session.",
      400
    );
  }

  const studentSnapshot = await db
    .collection(STUDENTS_COLLECTION)
    .where(
      "varsityId",
      "==",
      req.body.varsityId.trim()
    )
    .limit(1)
    .get();

  if (studentSnapshot.empty) {
    throw new AppError(
      "Face matched an unknown student ID.",
      404
    );
  }

  const studentDoc =
    studentSnapshot.docs[0];

  const recordsSnapshot = await db
    .collection(RECORDS_COLLECTION)
    .where(
      "sessionId",
      "==",
      session.id
    )
    .where(
      "studentId",
      "==",
      studentDoc.id
    )
    .limit(1)
    .get();

  if (recordsSnapshot.empty) {
    throw new AppError(
      "This student is not in the session. Add them manually first.",
      404
    );
  }

  const recordDoc =
    recordsSnapshot.docs[0];

  const record =
    normalizeDocument(
      recordDoc.id,
      recordDoc.data()
    );

  if (
    record.attendanceStatus !==
    AttendanceStatus.ABSENT
  ) {
    res.json({
      success: true,
      message:
        "Attendance already recorded for this student.",
      data: {
        record:
          serializeRecord({
            ...record,
            student:
              normalizeDocument(
                studentDoc.id,
                studentDoc.data()
              ),
          }),
      },
    });

    return;
  }

  const attendedAt = new Date();

  const attendanceStatus =
    resolveAttendanceStatus(
      session.startedAt,
      attendedAt
    );

  await recordDoc.ref.update({
    attendanceStatus,
    attendedAt,
    updatedAt: new Date(),
  });

  const updatedRecord = {
    ...record,
    attendanceStatus,
    attendedAt,
    student:
      normalizeDocument(
        studentDoc.id,
        studentDoc.data()
      ),
  };

  res.json({
    success: true,
    message:
      `Marked ${studentDoc.data().name} as ${attendanceStatus.toLowerCase()}.`,
    data: {
      record:
        serializeRecord(updatedRecord),
    },
  });
});