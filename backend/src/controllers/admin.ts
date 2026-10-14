import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import type { AuthUser } from "../middleware/auth";
import { currentMonth, monthRange } from "../utils/month";
import { expenseInclude, toExpenseDTO, toNumber, type ExpenseDTO } from "../utils/serialize";
import type { CategorySpending } from "./dashboard";

const RANKING_SIZE = 5;
const RECENT_LIMIT = 5;

export interface AdminExpenseDTO extends ExpenseDTO {
  user: { id: string; name: string; email: string };
}

export interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalValue: number;
  /** Expenses recorded (created) during the current calendar month. */
  expensesThisMonth: number;
  /** Every category, including unused ones, sorted by total spent. */
  spendingPerCategory: CategorySpending[];
  /** Most-used categories, by number of expenses. */
  topCategories: CategorySpending[];
  /** Least-used categories, by number of expenses. Unused categories count as zero. */
  bottomCategories: CategorySpending[];
  recentExpenses: AdminExpenseDTO[];
  recentUsers: AuthUser[];
}

/** GET /api/admin/insights. Platform-wide figures across all users. */
export async function getInsights(_req: Request, res: Response<AdminInsights>) {
  const { start, end } = monthRange(currentMonth());

  const [totalUsers, totals, expensesThisMonth, categories, grouped, recentExpenses, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.expense.aggregate({ _sum: { amount: true }, _count: { _all: true } }),
    prisma.expense.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.expense.groupBy({ by: ["categoryId"], _sum: { amount: true }, _count: { _all: true } }),
    prisma.expense.findMany({
      include: { ...expenseInclude, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: RECENT_LIMIT,
    }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: RECENT_LIMIT }),
  ]);

  // Start from all categories, so ones with no expenses still appear (with zero) in the rankings.
  const usage = new Map(grouped.map((g) => [g.categoryId, g]));
  const spendingPerCategory: CategorySpending[] = categories
    .map((c) => {
      const g = usage.get(c.id);
      return { categoryId: c.id, name: c.name, total: toNumber(g?._sum.amount), count: g?._count._all ?? 0 };
    })
    .sort((a, b) => b.total - a.total);

  const byUsage = [...spendingPerCategory].sort((a, b) => b.count - a.count || b.total - a.total);

  res.json({
    totalUsers,
    totalExpenses: totals._count._all,
    totalValue: toNumber(totals._sum.amount),
    expensesThisMonth,
    spendingPerCategory,
    topCategories: byUsage.slice(0, RANKING_SIZE),
    bottomCategories: byUsage.slice(-RANKING_SIZE).reverse(),
    recentExpenses: recentExpenses.map((e) => ({ ...toExpenseDTO(e), user: e.user })),
    recentUsers,
  });
}
