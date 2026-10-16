import { useEffect, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, CircularProgress,
  LinearProgress, Stack, TextField, Typography,
} from "@mui/material";
import { api, ApiError } from "../api/client";
import type { BudgetSummary } from "../types/api";

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "inherit"> = {
  within: "success", approaching: "warning", over: "error", none: "inherit",
};

function monthLabel(month: string) {
  const [y, m] = month.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

export function BudgetPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get<BudgetSummary>(`/budgets/${month}`)
      .then((s) => { setSummary(s); setAmount(s.amount != null ? String(s.amount) : ""); })
      .catch(() => setError("Failed to load budget."))
      .finally(() => setLoading(false));
  }, [month]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await api.put<BudgetSummary>(`/budgets/${month}`, { amount: Number(amount) });
      setSummary(updated);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save budget.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box maxWidth={560}>
      <Typography variant="h2" mb={3}>Budget</Typography>

      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <TextField type="month" label="Month" value={month} onChange={(e) => setMonth(e.target.value)}
          size="small" slotProps={{ inputLabel: { shrink: true } }} />
      </Stack>

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : summary && (
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Typography variant="h3" mb={2}>{monthLabel(month)}</Typography>

              {summary.status !== "none" && (
                <>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(summary.percentUsed ?? 0, 100)}
                    color={STATUS_COLOR[summary.status]}
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {summary.percentUsed?.toFixed(1)}% used
                  </Typography>
                </>
              )}

              <Stack spacing={1} mt={2}>
                <Row label="Budget" value={summary.amount != null ? `$${summary.amount.toFixed(2)}` : "Not set"} />
                <Row label="Spent" value={`$${summary.spent.toFixed(2)}`} />
                {summary.remaining != null && (
                  <Row label="Remaining" value={`$${summary.remaining.toFixed(2)}`}
                    color={summary.status === "over" ? "error.main" : "success.main"} />
                )}
                <Row label="Status" value={summary.status.charAt(0).toUpperCase() + summary.status.slice(1)}
                  color={`${STATUS_COLOR[summary.status]}.main`} />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h3" mb={2}>Set budget for {monthLabel(month)}</Typography>
              {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
              <Stack direction="row" spacing={2}>
                <TextField label="Amount ($)" type="number" value={amount}
                  onChange={(e) => setAmount(e.target.value)} size="small"
                  slotProps={{ input: { inputProps: { min: 0, step: "0.01" } } }} />
                <Button variant="contained" onClick={handleSave} disabled={saving || !amount}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={600} color={color}>{value}</Typography>
    </Stack>
  );
}
