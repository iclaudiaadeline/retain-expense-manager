import type { ReactNode } from "react";
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography,
} from "@mui/material";
import type { Expense } from "../../types/api";
import { PAYMENT_METHOD_LABELS } from "../../types/api";

interface Props {
  /** The expense to show, or null when the dialog is closed. */
  expense: Expense | null;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

/** "2026-12-15" → "15 December 2026". Divide manually, to avoid time zone moving the day. */
function formatDay(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("default", { day: "numeric", month: "long", year: "numeric" });
}

/** A full timestamp, e.g. createdAt, shown as "19 Oct 2026". */
function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleDateString("default", { day: "numeric", month: "short", year: "numeric" });
}


/** A single line in the details list. */
function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: 90, flexShrink: 0 }}>{label}</Typography>
      <Box sx={{ minWidth: 0, flex: 1 }}>{children}</Box>
    </Stack>
  );
}

/** Read-only view of one expense, with every field in full. The Edit and Delete buttons are moved to the existing Edit and Delete dialogs. */
export function ExpenseDetails({ expense, onClose, onEdit, onDelete }: Props) {
  return (
    <Dialog open={Boolean(expense)} onClose={onClose} fullWidth maxWidth="sm">
      {expense && (
        <>
          <DialogTitle sx={{ wordBreak: "break-word" }}>{expense.title}</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <DetailRow label="Amount">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>${expense.amount.toFixed(2)}</Typography>
              </DetailRow>
              <DetailRow label="Category">
                <Chip label={expense.category.name} size="small" variant="outlined" />
              </DetailRow>
              <DetailRow label="Date">
                <Typography variant="body2">{formatDay(expense.date)}</Typography>
              </DetailRow>
              <DetailRow label="Payment">
                <Typography variant="body2">{PAYMENT_METHOD_LABELS[expense.paymentMethod]}</Typography>
              </DetailRow>
              <DetailRow label="Notes">
                {expense.notes ? (
                  // pre-wrap keeps the line breaks the user typed
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{expense.notes}</Typography>
                ) : (
                  <Typography variant="body2" color="text.disabled">No notes</Typography>
                )}
              </DetailRow>
              <Typography variant="caption" color="text.secondary">
                Added {formatTimestamp(expense.createdAt)}
                {expense.updatedAt !== expense.createdAt && ` · Updated ${formatTimestamp(expense.updatedAt)}`}
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button color="error" onClick={() => onDelete(expense)} sx={{ mr: "auto" }}>Delete</Button>
            <Button onClick={() => onEdit(expense)}>Edit</Button>
            <Button variant="contained" onClick={onClose}>Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
