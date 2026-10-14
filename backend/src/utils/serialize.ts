import type { PaymentMethod, Prisma } from "../generated/prisma/client";

/** Prisma returns DECIMAL columns as Decimal objects. The API sends plain numbers. */
export function toNumber(value: Prisma.Decimal | null | undefined): number {
  return value ? value.toNumber() : 0;
}

/** Rounds to cents, to hide floating-point noise such as 0.30000000000000004. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** The related data loaded with every expense. */
export const expenseInclude = {
  category: { select: { id: true, name: true } },
} satisfies Prisma.ExpenseInclude;

type ExpenseWithCategory = Prisma.ExpenseGetPayload<{ include: typeof expenseInclude }>;

/** An expense as the API returns it. */
export interface ExpenseDTO {
  id: string;
  title: string;
  amount: number;
  /** Calendar day, YYYY-MM-DD. */
  date: string;
  paymentMethod: PaymentMethod;
  notes: string | null;
  category: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
}

export function toExpenseDTO(expense: ExpenseWithCategory): ExpenseDTO {
  return {
    id: expense.id,
    title: expense.title,
    amount: toNumber(expense.amount),
    date: expense.date.toISOString().slice(0, 10),
    paymentMethod: expense.paymentMethod,
    notes: expense.notes,
    category: expense.category,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };
}
