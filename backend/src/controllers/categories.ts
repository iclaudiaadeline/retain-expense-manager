import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import type { Category } from "../generated/prisma/client";
import type { CategoryInput } from "../schemas/category";
import { HttpError } from "../utils/HttpError";

/** 
 * checks whether the category name is already in use.
 * category names are unique case-insensitively, so "Food" and "food" clash.
 */
async function assertNameAvailable(name: string, exceptId?: string): Promise<void> {
  const clash = await prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, ...(exceptId && { NOT: { id: exceptId } }) },
  });
  if (clash) throw new HttpError(409, `A category named "${clash.name}" already exists`);
}

async function findCategoryOr404(id: string): Promise<Category> {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new HttpError(404, "Category not found");
  return category;
}

/** GET /api/categories. returns the category list for signed-in users. */
export async function listCategories(_req: Request, res: Response<Category[]>) {
  const categories = await prisma.category.findMany({ orderBy: [{ isDefault: "asc" }, { name: "asc" }] });
  res.json(categories);
}

/** POST /api/categories (admin only). creates new category */
export async function createCategory(req: Request<object, unknown, CategoryInput>, res: Response<Category>) {
  await assertNameAvailable(req.body.name);
  const category = await prisma.category.create({ data: { name: req.body.name } });
  res.status(201).json(category);
}

/** PATCH /api/categories/:id (admin only) updates a category's name. */
export async function updateCategory(req: Request<{ id: string }, unknown, CategoryInput>, res: Response<Category>) {
  const category = await findCategoryOr404(req.params.id);
  if (category.isDefault) throw new HttpError(400, "The default category cannot be renamed");

  await assertNameAvailable(req.body.name, category.id);
  const updated = await prisma.category.update({ where: { id: category.id }, data: { name: req.body.name } });
  res.json(updated);
}

/**
 * DELETE /api/categories/:id (admin only)
 * before deleting a category, move its expenses to the default "uncategorized" category. both operations happen in one transaction, so no expense is ever left without a category.
 * The default category cannot be deleted.
 */
export async function deleteCategory(
  req: Request<{ id: string }>,
  res: Response<{ message: string; reassignedExpenses: number }>,
) {
  const category = await findCategoryOr404(req.params.id);
  if (category.isDefault) throw new HttpError(400, "The default category cannot be deleted");

  const fallback = await prisma.category.findFirst({ where: { isDefault: true } });
  if (!fallback) throw new HttpError(500, "Default category is missing. Run the seed script.");

  const [moved] = await prisma.$transaction([
    prisma.expense.updateMany({ where: { categoryId: category.id }, data: { categoryId: fallback.id } }),
    prisma.category.delete({ where: { id: category.id } }),
  ]);

  res.json({
    message: `Deleted "${category.name}". ${moved.count} expense(s) moved to "${fallback.name}".`,
    reassignedExpenses: moved.count,
  });
}
