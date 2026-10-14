import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { currentUser } from "../middleware/auth";
import { parseOrThrow } from "../middleware/validate";
import type { BudgetInput } from "../schemas/budget";
import { monthSchema } from "../schemas/common";
import { getBudgetSummary, type BudgetSummary } from "../services/budgetSummary";

/** GET /api/budgets/:month. Returns status "none" when no budget is set, rather than a 404. */
export async function getBudget(req: Request<{ month: string }>, res: Response<BudgetSummary>) {
  const month = parseOrThrow(monthSchema, req.params.month);
  res.json(await getBudgetSummary(currentUser(req).id, month));
}

/** PUT /api/budgets/:month. Creates the month's budget, or replaces it if one exists. */
export async function setBudget(req: Request<{ month: string }, unknown, BudgetInput>, res: Response<BudgetSummary>) {
  const user = currentUser(req);
  const month = parseOrThrow(monthSchema, req.params.month);

  await prisma.budget.upsert({
    where: { userId_month: { userId: user.id, month } },
    create: { userId: user.id, month, amount: req.body.amount },
    update: { amount: req.body.amount },
  });

  res.json(await getBudgetSummary(user.id, month));
}
