import { useEffect, useState } from "react";
import { Grid, InputAdornment, MenuItem, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useCategories } from "../../hooks/useCategories";
import { PAYMENT_METHODS } from "../../types/api";
import { setFilter } from "../../store/filtersSlice";
import { useAppDispatch, useAppSelector } from "../../store/store";

export function ExpenseFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);
  const categories = useCategories();

  function set<K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) {
    dispatch(setFilter({ key, value }));
  }

  // What is typed in the search box. It reaches Redux, and so the API, only after a short pause,
  // so typing "lunch" sends one request instead of five.
  const [searchText, setSearchText] = useState(filters.search);

  // Follow Redux when the search changes from outside, e.g. the Reset button.
  useEffect(() => { setSearchText(filters.search); }, [filters.search]);

  useEffect(() => {
    if (searchText === filters.search) return;
    const timer = setTimeout(() => dispatch(setFilter({ key: "search", value: searchText })), 300);
    // A new key press before 300 ms cancels the pending search.
    return () => clearTimeout(timer);
  }, [searchText, filters.search, dispatch]);

  return (
    <Grid container spacing={1.5} sx={{ alignItems: "center" }}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField fullWidth size="small" placeholder="Search title or notes"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
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
          {PAYMENT_METHODS.map((m) => (
            <MenuItem key={m} value={m}>
              {m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </MenuItem>
          ))}
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
    </Grid>
  );
}
