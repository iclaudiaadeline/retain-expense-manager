import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { budgetsRouter } from "./routes/budgets";
import { categoriesRouter } from "./routes/categories";
import { dashboardRouter } from "./routes/dashboard";
import { expensesRouter } from "./routes/expenses";

/** The deployed frontend. Always allowed, so the live app keeps working whatever CLIENT_URL is set to. */
const PRODUCTION_CLIENT_URL = "https://retain-expense-manager-pm16-omega.vercel.app";

/** Only these websites may call the API from a browser. CLIENT_URL can list several, separated by commas. */
const allowedOrigins = new Set([
  ...env.CLIENT_URL.split(",").map((url) => url.trim().replace(/\/$/, "")),
  PRODUCTION_CLIENT_URL,
]);

export const app = express();

app.use(cors({ origin: [...allowedOrigins] }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/budgets", budgetsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/admin", adminRouter);

// These two must stay last: unmatched routes fall through to notFound, and all errors end in errorHandler.
app.use(notFound);
app.use(errorHandler);
