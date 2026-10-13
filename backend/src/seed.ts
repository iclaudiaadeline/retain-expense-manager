import bcrypt from "bcryptjs";
import { env } from "./config/env";
import { connectDB, disconnectDB, prisma } from "./config/prisma";
import { DEFAULT_CATEGORY_NAME } from "./constants";

const STARTER_CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Housing",
  "Utilities",
  "Health",
  "Education",
  "Entertainment",
  "Shopping",
];

/** Safe to run more than once: existing categories and the admin account are left in place. */
async function seed(): Promise<void> {
  await connectDB();

  const names = [...STARTER_CATEGORIES, DEFAULT_CATEGORY_NAME];
  for (const name of names) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, isDefault: name === DEFAULT_CATEGORY_NAME },
    });
  }
  console.log(`Categories in database: ${await prisma.category.count()}`);

  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    const email = env.ADMIN_EMAIL.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`Admin already exists: ${existing.email}`);
    } else {
      const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
      await prisma.user.create({
        data: { name: env.ADMIN_NAME, email, passwordHash, role: "admin" },
      });
      console.log(`Admin created: ${email}`);
    }
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin user.");
  }

  await disconnectDB();
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
