import { Router } from "express";
import { createCategory, deleteCategory, listCategories, updateCategory } from "../controllers/categories";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { categorySchema } from "../schemas/category";

export const categoriesRouter = Router();

categoriesRouter.use(requireAuth);

categoriesRouter.get("/", listCategories);
categoriesRouter.post("/", requireAdmin, validateBody(categorySchema), createCategory);
categoriesRouter.patch("/:id", requireAdmin, validateBody(categorySchema), updateCategory);
categoriesRouter.delete("/:id", requireAdmin, deleteCategory);
