import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "./env";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

/** The single database client shared by the whole app. */
export const prisma = new PrismaClient({
  adapter,
  // Keep the password hash out of every query unless it is asked for explicitly.
  omit: { user: { passwordHash: true } },
});

/** Runs a trivial query so a wrong DATABASE_URL fails at startup, not on the first request. */
export async function connectDB(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
  console.log("PostgreSQL connected");
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
}
