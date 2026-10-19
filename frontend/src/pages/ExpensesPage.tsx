import { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, Divider, IconButton,
  Pagination, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TableSortLabel, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { api, ApiError } from "../api/client";
import { ExpenseFilters } from "../components/expenses/ExpenseFilters";
import { ExpenseDetails } from "../components/expenses/ExpenseDetails";
import { ExpenseForm } from "../components/expenses/ExpenseForm";
import { useAppDispatch, useAppSelector } from "../store/store";
import { resetFilters, setFilter, toExpenseQuery } from "../store/filtersSlice";
import type { Expense, Paginated, SortBy } from "../types/api";
import { PAYMENT_METHOD_LABELS } from "../types/api";
import { HIDE_ON_PHONE } from "../utils/responsive";

export function ExpensesPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);
  const [data, setData] = useState<Paginated<Expense> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [viewing, setViewing] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<Paginated<Expense>>("/expenses", toExpenseQuery(filters));
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  /** Clicking the sorted column flips the order; clicking another column sorts by it, highest/newest first. */
  function handleSort(column: SortBy) {
    if (filters.sortBy === column) {
      dispatch(setFilter({ key: "sortOrder", value: filters.sortOrder === "desc" ? "asc" : "desc" }));
    } else {
      dispatch(setFilter({ key: "sortBy", value: column }));
      dispatch(setFilter({ key: "sortOrder", value: "desc" }));
    }
  }

  function openCreate() { setEditing(null); setFormOpen(true); }
  function openEdit(exp: Expense) { setViewing(null); setEditing(exp); setFormOpen(true); }
  function openDelete(exp: Expense) { setViewing(null); setDeleteError(null); setDeleteTarget(exp); }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/expenses/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Failed to delete expense.");
    } finally {
      // Reset on success too, otherwise the next delete dialog opens stuck on "Deleting..."
      setDeleting(false);
    }
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h2">Expenses</Typography>
          {data && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {data.pagination.total} record{data.pagination.total !== 1 ? "s" : ""}
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add expense
        </Button>
      </Stack>

      {/* Filters are always visible, so searching and filtering need no extra click */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5, borderRadius: 2 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="subtitle2">Filters</Typography>
          <Button size="small" onClick={() => dispatch(resetFilters())}>Reset</Button>
        </Stack>
        <ExpenseFilters />
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600, ...HIDE_ON_PHONE }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} sortDirection={filters.sortBy === "date" ? filters.sortOrder : false}>
                    <TableSortLabel
                      active={filters.sortBy === "date"}
                      direction={filters.sortBy === "date" ? filters.sortOrder : "desc"}
                      onClick={() => handleSort("date")}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, ...HIDE_ON_PHONE }}>Payment</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }} sortDirection={filters.sortBy === "amount" ? filters.sortOrder : false}>
                    <TableSortLabel
                      active={filters.sortBy === "amount"}
                      direction={filters.sortBy === "amount" ? filters.sortOrder : "desc"}
                      onClick={() => handleSort("amount")}
                    >
                      Amount
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ py: 6, textAlign: "center" }}>
                        <Typography color="text.secondary">No expenses found.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((exp) => (
                    <TableRow key={exp.id} hover onClick={() => setViewing(exp)} sx={{ cursor: "pointer" }}>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{exp.title}</Typography>
                        {exp.notes && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                            {exp.notes}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={HIDE_ON_PHONE}>
                        <Chip label={exp.category.name} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{exp.date}</Typography>
                      </TableCell>
                      <TableCell sx={HIDE_ON_PHONE}>
                        <Typography variant="body2">
                          {PAYMENT_METHOD_LABELS[exp.paymentMethod]}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ${exp.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      {/* stopPropagation: a click on a button here should not also open the row's details */}
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" title="View" onClick={() => setViewing(exp)}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" title="Edit" onClick={() => openEdit(exp)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" title="Delete" onClick={() => openDelete(exp)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {data && data.pagination.totalPages > 1 && (
            <>
              <Divider />
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", px: 2, py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </Typography>
                <Pagination
                  count={data.pagination.totalPages}
                  page={data.pagination.page}
                  onChange={(_, p) => dispatch(setFilter({ key: "page", value: p }))}
                  color="primary"
                  size="small"
                />
              </Stack>
            </>
          )}
        </Paper>
      )}

      <ExpenseDetails expense={viewing} onClose={() => setViewing(null)} onEdit={openEdit} onDelete={openDelete} />

      <ExpenseForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} expense={editing} />

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete expense?</DialogTitle>
        <DialogContent>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
