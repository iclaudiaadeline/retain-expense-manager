import { useEffect, useState } from "react";
import {
  Alert, Box, Card, CardContent, Chip, CircularProgress, Grid,
  LinearProgress, Stack, TextField, Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { api } from "../api/client";
import type { Dashboard } from "../types/api";
import { useAuth } from "../hooks/useAuth";

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "inherit"> = {
  within: "success", approaching: "warning", over: "error", none: "inherit",
};

export function DashboardPage() {
  const { user } = useAuth();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get<Dashboard>("/dashboard", { month })
      .then(setData)
      .catch(() => setError("Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, [month]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h2">Dashboard</Typography>
          <Typography color="text.secondary">Welcome back, {user?.name}</Typography>
        </Box>
        <TextField type="month" label="Month" value={month} onChange={(e) => setMonth(e.target.value)}
          size="small" slotProps={{ inputLabel: { shrink: true } }} />
      </Stack>

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : data && (
        <Stack spacing={3}>
          {/* Summary cards */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard icon={<TrendingUpIcon color="primary" />} label="Total spent" value={`$${data.totalSpent.toFixed(2)}`} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard icon={<ReceiptLongOutlinedIcon color="primary" />} label="Expenses" value={String(data.expenseCount)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                icon={<AccountBalanceWalletOutlinedIcon color="primary" />}
                label="Budget remaining"
                value={data.budget.remaining != null ? `$${data.budget.remaining.toFixed(2)}` : "No budget"}
                sub={data.budget.status !== "none" ? data.budget.status : undefined}
                subColor={STATUS_COLOR[data.budget.status]}
              />
            </Grid>
            {data.highestExpense && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<TrendingUpIcon color="error" />} label="Highest expense"
                  value={`$${data.highestExpense.amount.toFixed(2)}`} sub={data.highestExpense.title} />
              </Grid>
            )}
          </Grid>

          {/* Budget progress */}
          {data.budget.status !== "none" && data.budget.percentUsed != null && (
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography fontWeight={600}>Budget usage</Typography>
                  <Typography color="text.secondary">{data.budget.percentUsed.toFixed(1)}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={Math.min(data.budget.percentUsed, 100)}
                  color={STATUS_COLOR[data.budget.status]} sx={{ height: 10, borderRadius: 5 }} />
                <Stack direction="row" justifyContent="space-between" mt={1}>
                  <Typography variant="caption" color="text.secondary">$0</Typography>
                  <Typography variant="caption" color="text.secondary">${data.budget.amount?.toFixed(2)}</Typography>
                </Stack>
              </CardContent>
            </Card>
          )}

          <Grid container spacing={2}>
            {/* Spending by category */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h3" mb={2}>Spending by category</Typography>
                  {data.spendingByCategory.length === 0 ? (
                    <Typography color="text.secondary">No data yet.</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {data.spendingByCategory.map((c) => {
                        const pct = data.totalSpent > 0 ? (c.total / data.totalSpent) * 100 : 0;
                        return (
                          <Box key={c.categoryId}>
                            <Stack direction="row" justifyContent="space-between" mb={0.5}>
                              <Typography variant="body2">{c.name}</Typography>
                              <Typography variant="body2" fontWeight={600}>${c.total.toFixed(2)}</Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3 }} />
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Recent expenses */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h3" mb={2}>Recent expenses</Typography>
                  {data.recentExpenses.length === 0 ? (
                    <Typography color="text.secondary">No expenses this month.</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {data.recentExpenses.map((exp) => (
                        <Stack key={exp.id} direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{exp.title}</Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="caption" color="text.secondary">{exp.date}</Typography>
                              <Chip label={exp.category.name} size="small" sx={{ height: 16, fontSize: 10 }} />
                            </Stack>
                          </Box>
                          <Typography fontWeight={600}>${exp.amount.toFixed(2)}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      )}
    </Box>
  );
}

function StatCard({ icon, label, value, sub, subColor }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; subColor?: "success" | "warning" | "error" | "inherit";
}) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
          {icon}
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Stack>
        <Typography variant="h2">{value}</Typography>
        {sub && <Typography variant="caption" color={subColor ? `${subColor}.main` : "text.secondary"}>{sub}</Typography>}
      </CardContent>
    </Card>
  );
}
