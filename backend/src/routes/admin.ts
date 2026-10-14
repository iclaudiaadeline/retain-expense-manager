import { Router } from "express";
import { getInsights } from "../controllers/admin";
import { requireAdmin, requireAuth } from "../middleware/auth";

export const adminRouter = Router();

// Every route in this file is admin-only.
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/insights", getInsights);
