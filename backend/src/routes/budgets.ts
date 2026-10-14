import { Router } from "express";
import { getBudget, setBudget } from "../controllers/budgets";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { budgetSchema } from "../schemas/budget";

export const budgetsRouter = Router();

budgetsRouter.use(requireAuth);

budgetsRouter.get("/:month", getBudget);
budgetsRouter.put("/:month", validateBody(budgetSchema), setBudget);
