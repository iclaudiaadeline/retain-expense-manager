import { Router } from "express";
import { createExpense, deleteExpense, getExpense, listExpenses, updateExpense } from "../controllers/expenses";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createExpenseSchema, updateExpenseSchema } from "../schemas/expense";

export const expensesRouter = Router();

expensesRouter.use(requireAuth);

expensesRouter.get("/", listExpenses);
expensesRouter.post("/", validateBody(createExpenseSchema), createExpense);
expensesRouter.get("/:id", getExpense);
expensesRouter.patch("/:id", validateBody(updateExpenseSchema), updateExpense);
expensesRouter.delete("/:id", deleteExpense);
