import cors from "cors";
import express from "express";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { budgetsRouter } from "./routes/budgets";
import { categoriesRouter } from "./routes/categories";
import { dashboardRouter } from "./routes/dashboard";
import { expensesRouter } from "./routes/expenses";

export const app = express();

app.use(cors({ origin: true }));
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
