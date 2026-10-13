/// <reference types="node" />
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx src/seed.ts",
  },
  datasource: {
    // Read leniently: "prisma generate" runs on npm install, before a .env file may exist.
    url: process.env.DATABASE_URL ?? "",
  },
});
