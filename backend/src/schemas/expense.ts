import { z } from "zod";
import { PaymentMethod } from "../generated/prisma/client";
import { dateSchema, moneySchema } from "./common";

export const createExpenseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title must be at most 120 characters"),
  amount: moneySchema,
  categoryId: z.string().min(1, "Category is required"),
  date: dateSchema,
  paymentMethod: z.enum(PaymentMethod, "Choose a valid payment method"),
  // Blank notes are stored as null. Undefined is kept as-is, so a PATCH without notes leaves them unchanged.
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be at most 500 characters")
    .nullish()
    .transform((value) => (value === undefined ? undefined : value || null)),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expenseQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    categoryId: z.string().optional(),
    paymentMethod: z.enum(PaymentMethod).optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    minAmount: z.coerce.number().nonnegative().optional(),
    maxAmount: z.coerce.number().nonnegative().optional(),
    sortBy: z.enum(["date", "amount"]).default("date"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .refine((q) => !q.startDate || !q.endDate || q.startDate <= q.endDate, {
    message: "Start date must be on or before end date",
    path: ["endDate"],
  })
  .refine((q) => q.minAmount === undefined || q.maxAmount === undefined || q.minAmount <= q.maxAmount, {
    message: "Minimum amount must not be greater than maximum amount",
    path: ["maxAmount"],
  });

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQuery = z.infer<typeof expenseQuerySchema>;
