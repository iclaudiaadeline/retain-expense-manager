import { app } from "./app";
import { connectDB } from "./config/prisma";
import { env } from "./config/env";

async function start(): Promise<void> {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Retain API listening on http://localhost:${env.PORT}`);
  });
}

start().catch((err: unknown) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
