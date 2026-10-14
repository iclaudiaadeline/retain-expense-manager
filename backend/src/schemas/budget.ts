import { z } from "zod";
import { moneySchema } from "./common";

export const budgetSchema = z.object({
  amount: moneySchema,
});

export type BudgetInput = z.infer<typeof budgetSchema>;
