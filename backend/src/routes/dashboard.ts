import { Router } from "express";
import { getDashboard } from "../controllers/dashboard";
import { requireAuth } from "../middleware/auth";

export const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth, getDashboard);
