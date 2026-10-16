import { useEffect, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Divider, Grid, LinearProgress, Stack, TextField, Typography,
} from "@mui/material";
import { api, ApiError } from "../api/client";
import type { BudgetSummary } from "../types/api";

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default"> = {
  within: "success", approaching: "warning", over: "error", none: "default",
};

const STATUS_LABEL: Record<string, string> = {
  within: "Within budget", approaching: "Approaching limit", over: "Over budget", none: "No budget set",
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
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    api.get<BudgetSummary>(`/budgets/${month}`)
      .then((s) => { setSummary(s); setAmount(s.amount != null ? String(s.amount) : ""); })
      .catch(() => setError("Failed to load budget."))
      .finally(() => setLoading(false));
  }, [month]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const updated = await api.put<BudgetSummary>(`/budgets/${month}`, { amount: Number(amount) });
      setSummary(updated);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save budget.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        mb={3}
      >
        <Typography variant="h2">Budget</Typography>
        <TextField
          type="month"
          label="Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : summary ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h3">{monthLabel(month)}</Typography>
                  <Chip
                    label={STATUS_LABEL[summary.status]}
                    color={STATUS_COLOR[summary.status]}
                    size="small"
                  />
                </Stack>

                {summary.status !== "none" && summary.percentUsed != null ? (
                  <Box mb={3}>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        ${summary.spent.toFixed(2)} spent
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {summary.percentUsed.toFixed(1)}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(summary.percentUsed, 100)}
                      color={STATUS_COLOR[summary.status] === "default" ? "inherit" : STATUS_COLOR[summary.status]}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Stack direction="row" justifyContent="space-between" mt={0.75}>
                      <Typography variant="caption" color="text.disabled">$0</Typography>
                      <Typography variant="caption" color="text.disabled">
                        ${summary.amount?.toFixed(2)}
                      </Typography>
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ py: 3, mb: 2, textAlign: "center", bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography color="text.secondary" variant="body2">
                      No budget set for {monthLabel(month)}.
                    </Typography>
                    <Typography color="text.disabled" variant="caption">
                      Use the form on the right to set one.
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ mb: 2.5 }} />

                <Stack spacing={1.5}>
                  <BudgetRow
                    label="Budget"
                    value={summary.amount != null ? `$${summary.amount.toFixed(2)}` : "Not set"}
                  />
                  <BudgetRow label="Spent" value={`$${summary.spent.toFixed(2)}`} />
                  {summary.remaining != null && (
                    <BudgetRow
                      label="Remaining"
                      value={`$${summary.remaining.toFixed(2)}`}
                      valueColor={summary.status === "over" ? "error.main" : "success.main"}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h3" mb={0.5}>
                  {summary.amount != null ? "Update budget" : "Set a budget"}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {summary.amount != null
                    ? `Current budget for ${monthLabel(month)} is $${summary.amount.toFixed(2)}.`
                    : `Set a spending limit for ${monthLabel(month)}.`}
                </Typography>

                {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
                {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>Budget saved.</Alert>}

                <Stack spacing={2}>
                  <TextField
                    label="Amount ($)"
                    type="number"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setSaveSuccess(false); }}
                    fullWidth
                    slotProps={{ input: { inputProps: { min: 0, step: "0.01" } } }}
                  />
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    disabled={saving || !amount || Number(amount) <= 0}
                    fullWidth
                  >
                    {saving ? "Saving..." : summary.amount != null ? "Update" : "Save"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
}

function BudgetRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={600} color={valueColor ?? "text.primary"}>{value}</Typography>
    </Stack>
  );
}
