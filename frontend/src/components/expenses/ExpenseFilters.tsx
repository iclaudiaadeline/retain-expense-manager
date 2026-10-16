import { Button, Grid, InputAdornment, MenuItem, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { Category } from "../../types/api";
import { PAYMENT_METHODS } from "../../types/api";
import { resetFilters, setFilter } from "../../store/filtersSlice";
import { useAppDispatch, useAppSelector } from "../../store/store";

export function ExpenseFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get<Category[]>("/categories").then(setCategories).catch(() => {});
  }, []);

  function set<K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) {
    dispatch(setFilter({ key, value }));
  }

  return (
    <Grid container spacing={1.5} alignItems="center">
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField fullWidth size="small" placeholder="Search title or notes"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3, md: 2 }}>
        <TextField select fullWidth size="small" label="Category" value={filters.categoryId}
          onChange={(e) => set("categoryId", e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
      </Grid>
      <Grid size={{ xs: 6, sm: 3, md: 2 }}>
        <TextField select fullWidth size="small" label="Payment" value={filters.paymentMethod}
          onChange={(e) => set("paymentMethod", e.target.value as typeof filters.paymentMethod)}>
          <MenuItem value="">All</MenuItem>
          {PAYMENT_METHODS.map((m) => <MenuItem key={m} value={m}>{m.replace("_", " ")}</MenuItem>)}
        </TextField>
      </Grid>
      <Grid size={{ xs: 6, sm: 3, md: 2 }}>
        <TextField fullWidth size="small" label="From" type="date" value={filters.startDate}
          onChange={(e) => set("startDate", e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3, md: 2 }}>
        <TextField fullWidth size="small" label="To" type="date" value={filters.endDate}
          onChange={(e) => set("endDate", e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3, md: 2 }}>
        <TextField fullWidth size="small" label="Min $" type="number" value={filters.minAmount}
          onChange={(e) => set("minAmount", e.target.value)} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3, md: 2 }}>
        <TextField fullWidth size="small" label="Max $" type="number" value={filters.maxAmount}
          onChange={(e) => set("maxAmount", e.target.value)} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3, md: 2 }}>
        <TextField select fullWidth size="small" label="Sort by" value={filters.sortBy}
          onChange={(e) => set("sortBy", e.target.value as typeof filters.sortBy)}>
          <MenuItem value="date">Date</MenuItem>
          <MenuItem value="amount">Amount</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 6, sm: 3, md: 2 }}>
        <TextField select fullWidth size="small" label="Order" value={filters.sortOrder}
          onChange={(e) => set("sortOrder", e.target.value as typeof filters.sortOrder)}>
          <MenuItem value="desc">Newest first</MenuItem>
          <MenuItem value="asc">Oldest first</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: "auto" }}>
        <Button size="small" onClick={() => dispatch(resetFilters())}>Reset</Button>
      </Grid>
    </Grid>
  );
}
