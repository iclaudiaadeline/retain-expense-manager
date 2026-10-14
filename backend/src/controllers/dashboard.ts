import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { currentUser } from "../middleware/auth";
import { parseQuery } from "../middleware/validate";
import { monthSchema } from "../schemas/common";
import { getBudgetSummary, type BudgetSummary } from "../services/budgetSummary";
import { currentMonth, monthRange } from "../utils/month";
import { expenseInclude, toExpenseDTO, toNumber, type ExpenseDTO } from "../utils/serialize";

const RECENT_LIMIT = 5;

const dashboardQuerySchema = z.object({ month: monthSchema.optional() });

export interface CategorySpending {
  categoryId: string;
  name: string;
  total: number;
  count: number;
}

export interface DashboardResponse {
  month: string;
  totalSpent: number;
  expenseCount: number;
  budget: BudgetSummary;
  highestExpense: ExpenseDTO | null;
  spendingByCategory: CategorySpending[];
  recentExpenses: ExpenseDTO[];
}

/** GET /api/dashboard?month=YYYY-MM. Everything the user dashboard shows, for one month (default: current). */
export async function getDashboard(req: Request, res: Response<DashboardResponse>) {
  const user = currentUser(req);
  const month = parseQuery(dashboardQuerySchema, req.query).month ?? currentMonth();
  const { start, end } = monthRange(month);
  const where = { userId: user.id, date: { gte: start, lt: end } };

  const [budget, count, highest, grouped, recent] = await Promise.all([
    getBudgetSummary(user.id, month),
    prisma.expense.count({ where }),
    prisma.expense.findFirst({ where, include: expenseInclude, orderBy: { amount: "desc" } }),
    prisma.expense.groupBy({ by: ["categoryId"], where, _sum: { amount: true }, _count: { _all: true } }),
    prisma.expense.findMany({
      where,
      include: expenseInclude,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: RECENT_LIMIT,
    }),
  ]);

  const categories = await prisma.category.findMany({
    where: { id: { in: grouped.map((g) => g.categoryId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  const spendingByCategory = grouped
    .map((g) => ({
      categoryId: g.categoryId,
      name: nameById.get(g.categoryId) ?? "Unknown",
      total: toNumber(g._sum.amount),
      count: g._count._all,
    }))
    .sort((a, b) => b.total - a.total);

  res.json({
    month,
    totalSpent: budget.spent,
    expenseCount: count,
    budget,
    highestExpense: highest ? toExpenseDTO(highest) : null,
    spendingByCategory,
    recentExpenses: recent.map(toExpenseDTO),
  });
}
