import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@iot-attendance.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  const adminName = process.env.ADMIN_NAME || "System Admin";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: Role.ADMIN,
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      department: "Administration",
      gender: "Other",
    },
  });

  const teacherPassword = await bcrypt.hash("Teacher@123", 12);

  await prisma.user.upsert({
    where: { email: "mustafa@iot-attendance.local" },
    update: {},
    create: {
      name: "Mustafa",
      email: "mustafa@iot-attendance.local",
      passwordHash: teacherPassword,
      role: Role.TEACHER,
      department: "CSE",
      gender: "Male",
    },
  });

  await prisma.user.upsert({
    where: { email: "labiba@iot-attendance.local" },
    update: {},
    create: {
      name: "Labiba",
      email: "labiba@iot-attendance.local",
      passwordHash: teacherPassword,
      role: Role.TEACHER,
      department: "MECH",
      gender: "Female",
    },
  });

  const students = [
    { name: "Andelif", varsityId: "202201", department: "CSE", year: 4, semester: 2, section: "A" },
    { name: "Arnob", varsityId: "202241", department: "CSE", year: 4, semester: 2, section: "A" },
    { name: "Fahim", varsityId: "202214", department: "CSE", year: 4, semester: 2, section: "A" },
    { name: "Nusrat Sultana", varsityId: "202202", department: "CSE", year: 4, semester: 2, section: "A" },
    { name: "Rakib Hasan", varsityId: "202203", department: "CSE", year: 4, semester: 2, section: "B" },
    { name: "Fatima Akter", varsityId: "202204", department: "CSE", year: 4, semester: 2, section: "B" },
    { name: "Mahin Khan", varsityId: "202205", department: "CSE", year: 2, semester: 1, section: "B" },
    { name: "Sumaiya Ahmed", varsityId: "202206", department: "EEE", year: 2, semester: 2, section: "A" },
  ];

  for (const student of students) {
    await prisma.student.upsert({
      where: { varsityId: student.varsityId },
      update: student,
      create: student,
    });
  }

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
  console.log("Teacher login: mustafa@iot-attendance.local / Teacher@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
