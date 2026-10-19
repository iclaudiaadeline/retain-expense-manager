import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ExpenseQuery, PaymentMethod, SortBy, SortOrder } from "../types/api";

export interface FiltersState {
  search: string;
  categoryId: string;
  paymentMethod: PaymentMethod | "";
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

const initialState: FiltersState = {
  search: "",
  categoryId: "",
  paymentMethod: "",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  sortOrder: "desc",
  page: 1,
  limit: 10,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setFilter<K extends keyof FiltersState>(
      state: FiltersState,
      action: PayloadAction<{ key: K; value: FiltersState[K] }>
    ) {
      (state[action.payload.key] as FiltersState[K]) = action.payload.value;
      // Reset to page 1 whenever anything other than page itself changes
      if (action.payload.key !== "page") state.page = 1;
    },
    resetFilters: () => initialState,
  },
});

export const { setFilter, resetFilters } = filtersSlice.actions;


/** A class to convert the FiltersState to a clean ExpenseQuery (excluding empty strings). */
export function toExpenseQuery(filters: FiltersState): ExpenseQuery {
  return {
    ...(filters.search && { search: filters.search }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.minAmount && { minAmount: Number(filters.minAmount) }),
    ...(filters.maxAmount && { maxAmount: Number(filters.maxAmount) }),
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: filters.page,
    limit: filters.limit,
  };
}

export default filtersSlice.reducer;
