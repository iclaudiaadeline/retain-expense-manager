import type { BudgetStatus } from "../types/api";


// Each budget status has its own label to display in the app.
export const BUDGET_STATUS_LABEL: Record<BudgetStatus, string> = {
  none: "No budget set",
  within: "Within budget",
  approaching: "Approaching limit",
  over: "Over budget",
};

// colors used for budget status chips. 
export const BUDGET_STATUS_CHIP_COLOR: Record<BudgetStatus, "default" | "success" | "warning" | "error"> = {
  none: "default",
  within: "success",
  approaching: "warning",
  over: "error",
};

// colors used for budget progress bars and text in the budget summary card.
export const BUDGET_STATUS_COLOR: Record<BudgetStatus, "inherit" | "success" | "warning" | "error"> = {
  none: "inherit",
  within: "success",
  approaching: "warning",
  over: "error",
};
