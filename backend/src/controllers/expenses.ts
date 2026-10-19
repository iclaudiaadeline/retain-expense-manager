import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import type { Prisma } from "../generated/prisma/client";
import { currentUser } from "../middleware/auth";
import { parseQuery } from "../middleware/validate";
import {
  expenseQuerySchema,
  type CreateExpenseInput,
  type ExpenseQuery,
  type UpdateExpenseInput,
} from "../schemas/expense";
import { HttpError } from "../utils/HttpError";
import { expenseInclude, toExpenseDTO, type ExpenseDTO } from "../utils/serialize";

export interface Paginated<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/** Builds DB filter from the query parameters. scoped to userId so users only ever see their own expenses. */
function buildWhere(userId: string, q: ExpenseQuery): Prisma.ExpenseWhereInput {
  return {
    userId,
    categoryId: q.categoryId,
    paymentMethod: q.paymentMethod,
    ...((q.startDate || q.endDate) && {
      date: {
        gte: q.startDate ? new Date(q.startDate) : undefined,
        lte: q.endDate ? new Date(q.endDate) : undefined,
      },
    }),
    ...((q.minAmount !== undefined || q.maxAmount !== undefined) && {
      amount: { gte: q.minAmount, lte: q.maxAmount },
    }),
    ...(q.search && {
      OR: [
        { title: { contains: q.search, mode: "insensitive" } },
        { notes: { contains: q.search, mode: "insensitive" } },
      ],
    }),
  };
}

/** finds a user's expense or throws a 404 error to hide whether an ID is valid. */
async function findOwnedExpenseOr404(id: string, userId: string) {
  const expense = await prisma.expense.findFirst({ where: { id, userId }, include: expenseInclude });
  if (!expense) throw new HttpError(404, "Expense not found");
  return expense;
}

async function assertCategoryExists(categoryId: string): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new HttpError(400, "Validation failed", { categoryId: "Category does not exist" });
}

/** GET /api/expenses paginated expense search and filtering. */
export async function listExpenses(req: Request, res: Response<Paginated<ExpenseDTO>>) {
  const user = currentUser(req);
  const q = parseQuery(expenseQuerySchema, req.query);
  const where = buildWhere(user.id, q);

  const [total, expenses] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      include: expenseInclude,
      // Fallback sort by createdAt to ensure a stable order when the primary sort field has duplicates.
      orderBy: [{ [q.sortBy]: q.sortOrder }, { createdAt: "desc" }],
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    }),
  ]);

  res.json({
    data: expenses.map(toExpenseDTO),
    pagination: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) },
  });
}

/** GET /api/expenses/:id */
export async function getExpense(req: Request<{ id: string }>, res: Response<ExpenseDTO>) {
  const expense = await findOwnedExpenseOr404(req.params.id, currentUser(req).id);
  res.json(toExpenseDTO(expense));
}

/** POST /api/expenses */
export async function createExpense(req: Request<object, unknown, CreateExpenseInput>, res: Response<ExpenseDTO>) {
  const user = currentUser(req);
  const { date, notes, ...rest } = req.body;
  await assertCategoryExists(rest.categoryId);

  const expense = await prisma.expense.create({
    data: { ...rest, notes: notes ?? null, date: new Date(date), userId: user.id },
    include: expenseInclude,
  });
  res.status(201).json(toExpenseDTO(expense));
}

/** PATCH /api/expenses/:id. Only the fields sent are changed. */
export async function updateExpense(
  req: Request<{ id: string }, unknown, UpdateExpenseInput>,
  res: Response<ExpenseDTO>,
) {
  const existing = await findOwnedExpenseOr404(req.params.id, currentUser(req).id);
  const { date, ...rest } = req.body;
  if (rest.categoryId) await assertCategoryExists(rest.categoryId);

  const expense = await prisma.expense.update({
    where: { id: existing.id },
    data: { ...rest, ...(date && { date: new Date(date) }) },
    include: expenseInclude,
  });
  res.json(toExpenseDTO(expense));
}

/** DELETE /api/expenses/:id */
export async function deleteExpense(req: Request<{ id: string }>, res: Response) {
  const existing = await findOwnedExpenseOr404(req.params.id, currentUser(req).id);
  await prisma.expense.delete({ where: { id: existing.id } });
  res.status(204).end();
}
