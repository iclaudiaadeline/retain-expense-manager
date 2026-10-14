import { prisma } from "../config/prisma";
import { monthRange } from "../utils/month";
import { roundMoney, toNumber } from "../utils/serialize";

/** At or above this share of the budget, the status becomes "approaching". */
export const APPROACHING_THRESHOLD = 0.8;

export type BudgetStatus = "none" | "within" | "approaching" | "over";

export interface BudgetSummary {
  month: string;
  /** null when no budget has been set for the month. */
  amount: number | null;
  spent: number;
  remaining: number | null;
  /** Share of the budget used, as a percentage. null when no budget is set. */
  percentUsed: number | null;
  status: BudgetStatus;
}

export function budgetStatus(amount: number | null, spent: number): BudgetStatus {
  if (amount === null) return "none";
  if (spent > amount) return "over";
  if (spent >= amount * APPROACHING_THRESHOLD) return "approaching";
  return "within";
}

/** Budget, spending and status for one user and one month. Used by the budget and dashboard endpoints. */
export async function getBudgetSummary(userId: string, month: string): Promise<BudgetSummary> {
  const { start, end } = monthRange(month);

  const [budget, spending] = await Promise.all([
    prisma.budget.findUnique({ where: { userId_month: { userId, month } } }),
    prisma.expense.aggregate({
      where: { userId, date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
  ]);

  const spent = toNumber(spending._sum.amount);
  const amount = budget ? toNumber(budget.amount) : null;

  return {
    month,
    amount,
    spent,
    remaining: amount === null ? null : roundMoney(amount - spent),
    percentUsed: amount === null ? null : Math.round((spent / amount) * 1000) / 10,
    status: budgetStatus(amount, spent),
  };
}
