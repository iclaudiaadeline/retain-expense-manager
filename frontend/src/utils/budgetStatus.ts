import type { BudgetStatus } from "../types/api";

// Keyed by BudgetStatus, so TypeScript reports a missing or misspelled status.

/** How each budget status is described on screen. */
export const BUDGET_STATUS_LABEL: Record<BudgetStatus, string> = {
  none: "No budget set",
  within: "Within budget",
  approaching: "Approaching limit",
  over: "Over budget",
};

/** Colour for a status Chip. Chip has no "inherit", so "none" uses "default". */
export const BUDGET_STATUS_CHIP_COLOR: Record<BudgetStatus, "default" | "success" | "warning" | "error"> = {
  none: "default",
  within: "success",
  approaching: "warning",
  over: "error",
};

/** Colour for progress bars and text. LinearProgress has no "default", so "none" uses "inherit". */
export const BUDGET_STATUS_COLOR: Record<BudgetStatus, "inherit" | "success" | "warning" | "error"> = {
  none: "inherit",
  within: "success",
  approaching: "warning",
  over: "error",
};
