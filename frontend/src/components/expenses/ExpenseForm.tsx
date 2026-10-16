import { useEffect, useState } from "react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Stack, TextField, Alert,
} from "@mui/material";
import { api, ApiError } from "../../api/client";
import type { Category, Expense, ExpenseInput, PaymentMethod } from "../../types/api";
import { PAYMENT_METHODS } from "../../types/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  expense?: Expense | null;
}

const empty: ExpenseInput = { title: "", amount: 0, categoryId: "", date: "", paymentMethod: "cash", notes: "" };

export function ExpenseForm({ open, onClose, onSaved, expense }: Props) {
  const [form, setForm] = useState<ExpenseInput>(empty);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Category[]>("/categories").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title,
        amount: expense.amount,
        categoryId: expense.category.id,
        date: expense.date,
        paymentMethod: expense.paymentMethod,
        notes: expense.notes ?? "",
      });
    } else {
      setForm(empty);
    }
    setError(null);
    setFieldErrors({});
  }, [expense, open]);

  function set(key: keyof ExpenseInput, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const body = { ...form, amount: Number(form.amount), notes: form.notes || null };
      if (expense) {
        await api.patch(`/expenses/${expense.id}`, body);
      } else {
        await api.post("/expenses", body);
      }
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{expense ? "Edit expense" : "New expense"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Title" value={form.title} onChange={(e) => set("title", e.target.value)}
            error={Boolean(fieldErrors.title)} helperText={fieldErrors.title} required fullWidth />
          <TextField label="Amount" type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)}
            error={Boolean(fieldErrors.amount)} helperText={fieldErrors.amount} required fullWidth
            slotProps={{ input: { inputProps: { min: 0, step: "0.01" } } }} />
          <TextField label="Date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
            error={Boolean(fieldErrors.date)} helperText={fieldErrors.date} required fullWidth
            slotProps={{ inputLabel: { shrink: true } }} />
          <TextField select label="Category" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}
            error={Boolean(fieldErrors.categoryId)} helperText={fieldErrors.categoryId} required fullWidth>
            {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField select label="Payment method" value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value as PaymentMethod)} fullWidth>
            {PAYMENT_METHODS.map((m) => (
              <MenuItem key={m} value={m}>{m.replace("_", " ")}</MenuItem>
            ))}
          </TextField>
          <TextField label="Notes (optional)" value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)}
            multiline rows={2} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
