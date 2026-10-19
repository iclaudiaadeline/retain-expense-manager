/**
 * The shapes of the data the backend API sends and receives.
 * They mirror the backend's responses, so TypeScript catches any mismatch at compile time.
 * Dates arrive from JSON as strings: ISO timestamps for createdAt/updatedAt, YYYY-MM-DD for expense dates.
 */

// ---------- Users and auth ----------

export type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

/** Returned by POST /auth/register and POST /auth/login. */
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
}

// ---------- Categories ----------

export interface Category {
  id: string;
  name: string;
  /** True only for "Uncategorized", which cannot be renamed or deleted. */
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------- Expenses ----------

export const PAYMENT_METHODS = ["cash", "card", "mobile_money", "bank_transfer", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** How each payment method is shown on screen. */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  mobile_money: "Mobile money",
  bank_transfer: "Bank transfer",
  other: "Other",
};

export interface Expense {
  id: string;
  title: string;
  amount: number;
  /** Calendar day, YYYY-MM-DD. */
  date: string;
  paymentMethod: PaymentMethod;
  notes: string | null;
  category: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

/** Body of POST /expenses. PATCH /expenses/:id takes any subset of it. */
export interface ExpenseInput {
  title: string;
  amount: number;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string | null;
}

export type SortBy = "date" | "amount";
export type SortOrder = "asc" | "desc";

/** Query parameters of GET /expenses. Every one is optional. */
export interface ExpenseQuery {
  search?: string;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** A page of results, as returned by GET /expenses. */
export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

// ---------- Budgets ----------

export type BudgetStatus = "none" | "within" | "approaching" | "over";

/** Returned by GET and PUT /budgets/:month. The number fields are null when no budget is set. */
export interface BudgetSummary {
  /** YYYY-MM */
  month: string;
  amount: number | null;
  spent: number;
  remaining: number | null;
  percentUsed: number | null;
  status: BudgetStatus;
}

// ---------- Dashboards ----------

export interface CategorySpending {
  categoryId: string;
  name: string;
  total: number;
  count: number;
}

/** Returned by GET /dashboard?month=YYYY-MM. */
export interface Dashboard {
  month: string;
  totalSpent: number;
  expenseCount: number;
  budget: BudgetSummary;
  highestExpense: Expense | null;
  spendingByCategory: CategorySpending[];
  recentExpenses: Expense[];
}

/** An expense in the admin view, which also shows who recorded it. */
export interface AdminExpense extends Expense {
  user: { id: string; name: string; email: string };
}

/** Returned by GET /admin/insights. */
export interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalValue: number;
  expensesThisMonth: number;
  spendingPerCategory: CategorySpending[];
  topCategories: CategorySpending[];
  bottomCategories: CategorySpending[];
  recentExpenses: AdminExpense[];
  recentUsers: User[];
}

// ---------- Errors ----------

/** Every error response from the API has this shape. */
export interface ApiErrorBody {
  message: string;
  /** Field name to message, for validation errors. */
  errors?: Record<string, string>;
}
