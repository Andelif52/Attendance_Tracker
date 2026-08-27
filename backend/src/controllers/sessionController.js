import { AttendanceStatus, SessionStatus } from "@prisma/client";
import { prisma } from "../config/db.js";
import { resolveAttendanceStatus } from "../utils/attendance.js";
import {
  AppError,
  asyncHandler,
  serializeRecord,
  serializeSession,
} from "../utils/helpers.js";

const recordInclude = {
  student: true,
};

async function getAccessibleSession(sessionId, user) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      teacher: true,
      records: { include: recordInclude, orderBy: { id: "asc" } },
    },
  });

  if (!session) {
    throw new AppError("Session not found.", 404);
  }

  if (user && user.role !== "ADMIN" && session.teacherId !== user.id) {
    throw new AppError("You cannot access this session.", 403);
  }

  return session;
}

export const startSession = asyncHandler(async (req, res) => {
  const { subject, year, semester, section } = req.body;
  const normalizedSection = section.toUpperCase();

  const running = await prisma.session.findFirst({
    where: {
      teacherId: req.user.id,
      status: SessionStatus.RUNNING,
    },
  });

  if (running) {
    throw new AppError(
      "You already have a running session. End it before starting another.",
      409
    );
  }

  const students = await prisma.student.findMany({
    where: {
      year,
      semester,
      section: normalizedSection,
    },
  });

  const session = await prisma.$transaction(async (tx) => {
    const created = await tx.session.create({
      data: {
        teacherId: req.user.id,
        subject,
        year,
        semester,
        section: normalizedSection,
        status: SessionStatus.RUNNING,
      },
    });

    if (students.length > 0) {
      await tx.record.createMany({
        data: students.map((student) => ({
          sessionId: created.id,
          studentId: student.id,
          attendanceStatus: AttendanceStatus.ABSENT,
        })),
      });
    }

    return tx.session.findUnique({
      where: { id: created.id },
      include: {
        teacher: true,
        records: { include: recordInclude, orderBy: { id: "asc" } },
      },
    });
  });

  res.status(201).json({
    success: true,
    message: "Session started.",
    data: {
      session: serializeSession(session, {
        recordCount: session.records.length,
        records: session.records.map(serializeRecord),
      }),
    },
  });
});

export const listSessions = asyncHandler(async (req, res) => {
  const where =
    req.user.role === "ADMIN" ? {} : { teacherId: req.user.id };

  const sessions = await prisma.session.findMany({
    where,
    include: {
      teacher: true,
      _count: { select: { records: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  res.json({
    success: true,
    data: {
      sessions: sessions.map((session) =>
        serializeSession(session, { recordCount: session._count.records })
      ),
    },
  });
});

export const getSession = asyncHandler(async (req, res) => {
  const session = await getAccessibleSession(Number(req.params.id), req.user);

  res.json({
    success: true,
    data: {
      session: serializeSession(session, {
        records: session.records.map(serializeRecord),
      }),
    },
  });
});

export const endSession = asyncHandler(async (req, res) => {
  const session = await getAccessibleSession(Number(req.params.id), req.user);

  if (session.status === SessionStatus.ENDED) {
    throw new AppError("This session has already ended.", 400);
  }

  const updated = await prisma.session.update({
    where: { id: session.id },
    data: {
      status: SessionStatus.ENDED,
      endedAt: new Date(),
    },
    include: {
      teacher: true,
      records: { include: recordInclude, orderBy: { id: "asc" } },
    },
  });

  res.json({
    success: true,
    message: "Session ended.",
    data: {
      session: serializeSession(updated, {
        records: updated.records.map(serializeRecord),
      }),
    },
  });
});

export const addStudentToSession = asyncHandler(async (req, res) => {
  const session = await getAccessibleSession(Number(req.params.id), req.user);

  if (session.status !== SessionStatus.RUNNING) {
    throw new AppError("Students can only be added to a running session.", 400);
  }

  const student = await prisma.student.findUnique({
    where: { varsityId: req.body.varsityId.trim() },
  });

  if (!student) {
    throw new AppError("No student found with that varsity ID.", 404);
  }

  const existing = await prisma.record.findUnique({
    where: {
      sessionId_studentId: {
        sessionId: session.id,
        studentId: student.id,
      },
    },
  });

  if (existing) {
    throw new AppError("This student is already in the session.", 409);
  }

  const record = await prisma.record.create({
    data: {
      sessionId: session.id,
      studentId: student.id,
      attendanceStatus: AttendanceStatus.ABSENT,
    },
    include: recordInclude,
  });

  res.status(201).json({
    success: true,
    message: "Student added to the session.",
    data: { record: serializeRecord(record) },
  });
});

export const checkIn = asyncHandler(async (req, res) => {
  const sessionId = Number(req.params.id);

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new AppError("Session not found.", 404);
  }

  if (!req.isDevice && req.user) {
    if (req.user.role !== "ADMIN" && session.teacherId !== req.user.id) {
      throw new AppError("You cannot update this session.", 403);
    }
  }

  if (session.status !== SessionStatus.RUNNING) {
    throw new AppError("Attendance can only be marked on a running session.", 400);
  }

  const student = await prisma.student.findUnique({
    where: { varsityId: req.body.varsityId.trim() },
  });

  if (!student) {
    throw new AppError("Face matched an unknown student ID.", 404);
  }

  let record = await prisma.record.findUnique({
    where: {
      sessionId_studentId: {
        sessionId: session.id,
        studentId: student.id,
      },
    },
    include: recordInclude,
  });

  if (!record) {
    throw new AppError(
      "This student is not in the session. Add them manually first.",
      404
    );
  }

  if (record.attendanceStatus !== AttendanceStatus.ABSENT) {
    res.json({
      success: true,
      message: "Attendance already recorded for this student.",
      data: { record: serializeRecord(record) },
    });
    return;
  }

  const attendedAt = new Date();
  const attendanceStatus = resolveAttendanceStatus(session.startedAt, attendedAt);

  record = await prisma.record.update({
    where: { id: record.id },
    data: {
      attendanceStatus,
      attendedAt,
    },
    include: recordInclude,
  });

  res.json({
    success: true,
    message: `Marked ${student.name} as ${attendanceStatus.toLowerCase()}.`,
    data: { record: serializeRecord(record) },
  });
});
