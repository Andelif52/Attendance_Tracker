import { z } from "zod";

const email = z
  .string()
  .trim()
  .email("Enter a valid email address.");

const password = z
  .string()
  .min(6, "Password must be at least 6 characters.");

const idParam = z
  .string()
  .trim()
  .min(1, "ID is required.");

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name is required."),

    email,

    password,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email,

    password: z
      .string()
      .min(1, "Password is required."),
  }),
});

/* =========================
   STUDENT VALIDATION
========================= */

export const studentCreateSchema = z.object({
  body: z.object({
    id: z
      .string()
      .trim()
      .min(1, "Student ID is required."),

    name: z
      .string()
      .trim()
      .min(2, "Name is required."),

    department: z
      .string()
      .trim()
      .min(1, "Department is required."),

    batch: z
      .string()
      .trim()
      .optional(),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .optional(),

    face_enrolled: z
      .boolean()
      .optional(),

    is_active: z
      .boolean()
      .optional(),
  }),
});

export const studentUpdateSchema = z.object({
  params: z.object({
    id: idParam,
  }),

  body: z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .optional(),

    department: z
      .string()
      .trim()
      .min(1)
      .optional(),

    batch: z
      .string()
      .trim()
      .optional(),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .optional(),

    face_enrolled: z
      .boolean()
      .optional(),

    is_active: z
      .boolean()
      .optional(),
  }),
});

export const studentListSchema = z.object({
  query: z.object({
    department: z
      .string()
      .trim()
      .optional(),

    search: z
      .string()
      .trim()
      .optional(),
  }),
});

export const studentIdSchema = z.object({
  params: z.object({
    id: idParam,
  }),
});

/* =========================
   TEACHER VALIDATION
========================= */

export const teacherCreateSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name is required."),

    email,

    password,
  }),
});

export const teacherUpdateSchema = z.object({
  params: z.object({
    id: idParam,
  }),

  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2)
        .optional(),

      email: email.optional(),

      password: password.optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message:
          "At least one field must be provided for update.",
      }
    ),
});

export const teacherIdSchema = z.object({
  params: z.object({
    id: idParam,
  }),
});



/* =========================
   COURSE VALIDATION
========================= */

export const courseCreateSchema = z.object({
  body: z.object({
    course_code: z
      .string()
      .trim()
      .min(1, "Course code is required."),

    course_name: z
      .string()
      .trim()
      .min(1, "Course name is required."),

    department: z
      .string()
      .trim()
      .min(1, "Department is required."),

    section: z
      .string()
      .trim()
      .min(1, "Section is required."),

    teacher_id: z
      .string()
      .trim()
      .min(1, "Teacher ID is required."),
  }),
});


export const courseUpdateSchema = z.object({
  params: z.object({
    id: idParam,
  }),

  body: z
    .object({
      course_name: z
        .string()
        .trim()
        .min(1)
        .optional(),

      department: z
        .string()
        .trim()
        .min(1)
        .optional(),

      section: z
        .string()
        .trim()
        .min(1)
        .optional(),

      teacher_id: z
        .string()
        .trim()
        .min(1)
        .optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message:
          "At least one field must be provided for update.",
      }
    ),
});


export const courseListSchema = z.object({
  query: z.object({
    teacher_id: z
      .string()
      .trim()
      .optional(),

    department: z
      .string()
      .trim()
      .optional(),
  }),
});


export const courseIdSchema = z.object({
  params: z.object({
    id: idParam,
  }),
});



/* =========================
   ENROLLMENT VALIDATION
========================= */

export const enrollmentCreateSchema = z.object({
  params: z.object({
    course_id: idParam,
  }),

  body: z.object({
    student_id: z
      .string()
      .trim()
      .min(1, "Student ID is required."),
  }),
});


export const enrollmentDeleteSchema = z.object({
  params: z.object({
    course_id: idParam,

    student_id: idParam,
  }),
});










/* =========================
   SESSION VALIDATION
========================= */

export const startSessionSchema = z.object({
  body: z.object({
    subject: z
      .string()
      .trim()
      .min(1, "Subject is required."),

    year: z.coerce
      .number()
      .int()
      .min(1)
      .max(8),

    semester: z.coerce
      .number()
      .int()
      .min(1)
      .max(3),

    section: z
      .string()
      .trim()
      .min(1)
      .max(4),
  }),
});

export const sessionIdSchema = z.object({
  params: z.object({
    id: idParam,
  }),
});

export const addStudentToSessionSchema = z.object({
  params: z.object({
    id: idParam,
  }),

  body: z.object({
    varsityId: z
      .string()
      .trim()
      .min(1, "Varsity ID is required."),
  }),
});

export const checkInSchema = z.object({
  params: z.object({
    id: idParam,
  }),

  body: z.object({
    varsityId: z
      .string()
      .trim()
      .min(1, "Varsity ID is required."),
  }),
});