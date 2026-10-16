import { useCallback, useEffect, useState } from "react";
import { useAppDispatch } from "../store/store";
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, Pagination, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { api, ApiError } from "../api/client";
import { ExpenseFilters } from "../components/expenses/ExpenseFilters";
import { ExpenseForm } from "../components/expenses/ExpenseForm";
import { useAppSelector } from "../store/store";
import { resetFilters, setFilter, toExpenseQuery } from "../store/filtersSlice";
import type { Expense, Paginated } from "../types/api";

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash", card: "Card", mobile_money: "Mobile money",
  bank_transfer: "Bank transfer", other: "Other",
};

export function ExpensesPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);
  const [data, setData] = useState<Paginated<Expense> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  function openCreate() { setEditing(null); setFormOpen(true); }
  function openEdit(exp: Expense) { setEditing(exp); setFormOpen(true); }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/expenses/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h2">Expenses</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add expense</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <ExpenseFilters />
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No expenses found.
                    </TableCell>
                  </TableRow>
                )}
                {data?.data.map((exp) => (
                  <TableRow key={exp.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{exp.title}</Typography>
                      {exp.notes && <Typography variant="caption" color="text.secondary">{exp.notes}</Typography>}
                    </TableCell>
                    <TableCell><Chip label={exp.category.name} size="small" /></TableCell>
                    <TableCell>{exp.date}</TableCell>
                    <TableCell>{METHOD_LABELS[exp.paymentMethod] ?? exp.paymentMethod}</TableCell>
                    <TableCell align="right"><Typography fontWeight={600}>${exp.amount.toFixed(2)}</Typography></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(exp)}><EditOutlinedIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(exp)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {data && data.pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={data.pagination.totalPages}
                page={data.pagination.page}
                onChange={(_, p) => dispatch(setFilter({ key: "page", value: p }))}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <ExpenseForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} expense={editing} />

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete expense?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
