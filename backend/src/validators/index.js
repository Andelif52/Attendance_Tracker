import { z } from "zod";

const email = z.string().trim().email("Enter a valid email address.");
const password = z.string().min(6, "Password must be at least 6 characters.");
const idParam = z.coerce.number().int().positive();

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Name is required."),
    email,
    password,
    department: z.string().trim().min(1, "Department is required."),
    gender: z.enum(["Male", "Female", "Other"]),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1, "Password is required."),
  }),
});

export const studentCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Name is required."),
    varsityId: z.string().trim().min(3, "Varsity ID is required."),
    department: z.string().trim().min(1, "Department is required."),
    year: z.coerce.number().int().min(1).max(8),
    semester: z.coerce.number().int().min(1).max(3),
    section: z.string().trim().min(1).max(4),
  }),
});

export const studentUpdateSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({
    name: z.string().trim().min(2).optional(),
    varsityId: z.string().trim().min(3).optional(),
    department: z.string().trim().min(1).optional(),
    year: z.coerce.number().int().min(1).max(8).optional(),
    semester: z.coerce.number().int().min(1).max(3).optional(),
    section: z.string().trim().min(1).max(4).optional(),
  }),
});

const optionalNumber = z.preprocess(
  (value) => (value === undefined || value === "" ? undefined : Number(value)),
  z.number().int().optional()
);

export const studentListSchema = z.object({
  query: z.object({
    year: optionalNumber,
    semester: optionalNumber,
    section: z.string().trim().optional(),
    department: z.string().trim().optional(),
    search: z.string().trim().optional(),
  }),
});

export const studentIdSchema = z.object({
  params: z.object({ id: idParam }),
});

export const startSessionSchema = z.object({
  body: z.object({
    subject: z.string().trim().min(1, "Subject is required."),
    year: z.coerce.number().int().min(1).max(8),
    semester: z.coerce.number().int().min(1).max(3),
    section: z.string().trim().min(1).max(4),
  }),
});

export const sessionIdSchema = z.object({
  params: z.object({ id: idParam }),
});

export const addStudentToSessionSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({
    varsityId: z.string().trim().min(1, "Varsity ID is required."),
  }),
});

export const checkInSchema = z.object({
  params: z.object({ id: idParam }),
  body: z.object({
    varsityId: z.string().trim().min(1, "Varsity ID is required."),
  }),
});
