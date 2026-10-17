import { useEffect, useState } from "react";
import {
  Alert, Box, Card, CardContent, Chip, CircularProgress,
  Divider, Grid, LinearProgress, Stack, TextField, Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutlined";
import { api } from "../api/client";
import type { Dashboard } from "../types/api";
import { useAuth } from "../hooks/useAuth";

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "inherit"> = {
  within: "success", approaching: "warning", over: "error", none: "inherit",
};

const STATUS_LABEL: Record<string, string> = {
  within: "Within budget", approaching: "Approaching limit", over: "Over budget", none: "",
};

// Chip has no "inherit" color, so fall back to "default"
function chipColor(status: string) {
  const color = STATUS_COLOR[status];
  return color === "inherit" ? "default" : color;
}

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
      <Stack direction="row" sx={{ alignItems: "center", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <TextField
          type="month"
          label="Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Typography variant="body2" color="text.secondary">
          Welcome back, {user?.name}
        </Typography>
      </Stack>

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : data ? (
        <Stack spacing={3.5}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                icon={<TrendingUpIcon />}
                iconBg="#e8f5e9"
                iconColor="#2e7d32"
                label="Total spent"
                value={`$${data.totalSpent.toFixed(2)}`}
                sub={`${data.expenseCount} expense${data.expenseCount !== 1 ? "s" : ""} this month`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                icon={<AccountBalanceWalletOutlinedIcon />}
                iconBg={data.budget.status === "over" ? "#fce4ec" : "#e8f5e9"}
                iconColor={data.budget.status === "over" ? "#c62828" : "#2e7d32"}
                label="Budget remaining"
                value={data.budget.remaining != null ? `$${data.budget.remaining.toFixed(2)}` : "Not set"}
                sub={data.budget.status !== "none" ? STATUS_LABEL[data.budget.status] : "No budget set for this month"}
                subColor={data.budget.status !== "none" ? STATUS_COLOR[data.budget.status] : undefined}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                icon={<ReceiptLongOutlinedIcon />}
                iconBg="#e3f2fd"
                iconColor="#1565c0"
                label="Expenses recorded"
                value={String(data.expenseCount)}
                sub="transactions this month"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                icon={<StarOutlineIcon />}
                iconBg="#fff8e1"
                iconColor="#f57f17"
                label="Highest expense"
                value={data.highestExpense ? `$${data.highestExpense.amount.toFixed(2)}` : "None"}
                sub={data.highestExpense?.title ?? "No expenses yet"}
              />
            </Grid>
          </Grid>

          {data.budget.status !== "none" && data.budget.percentUsed != null && (
            <Card>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 600 }}>Budget usage</Typography>
                  <Chip
                    label={STATUS_LABEL[data.budget.status]}
                    size="small"
                    color={chipColor(data.budget.status)}
                  />
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(data.budget.percentUsed, 100)}
                  color={STATUS_COLOR[data.budget.status]}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Stack direction="row" sx={{ justifyContent: "space-between", mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    ${data.totalSpent.toFixed(2)} spent
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {data.budget.percentUsed.toFixed(1)}% of ${data.budget.amount?.toFixed(2)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          )}

          <Grid container spacing={2.5} sx={{ alignItems: "stretch" }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h3" sx={{ mb: 2 }}>Spending by category</Typography>
                  {data.spendingByCategory.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">
                      No spending recorded this month.
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      {data.spendingByCategory.map((c) => {
                        const pct = data.totalSpent > 0 ? (c.total / data.totalSpent) * 100 : 0;
                        return (
                          <Box key={c.categoryId}>
                            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.75 }}>
                              <Typography variant="body2">{c.name}</Typography>
                              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                <Typography variant="caption" color="text.secondary">
                                  {pct.toFixed(0)}%
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  ${c.total.toFixed(2)}
                                </Typography>
                              </Stack>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h3" sx={{ mb: 2 }}>Recent expenses</Typography>
                  {data.recentExpenses.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">
                      No expenses recorded this month.
                    </Typography>
                  ) : (
                    <Stack divider={<Divider />} spacing={0}>
                      {data.recentExpenses.map((exp) => (
                        <Stack key={exp.id} direction="row" sx={{ justifyContent: "space-between", alignItems: "center", py: 1.25 }}>
                          <Box sx={{ minWidth: 0, flex: 1, mr: 2 }}>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                              {exp.title}
                            </Typography>
                            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mt: 0.25 }}>
                              <Typography variant="caption" color="text.secondary">
                                {exp.date}
                              </Typography>
                              <Chip
                                label={exp.category.name}
                                size="small"
                                variant="outlined"
                                sx={{ height: 18, fontSize: 10, "& .MuiChip-label": { px: 0.75 } }}
                              />
                            </Stack>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                            ${exp.amount.toFixed(2)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      ) : null}
    </Box>
  );
}

function StatCard({ icon, iconBg, iconColor, label, value, sub, subColor }: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  subColor?: "success" | "warning" | "error" | "inherit";
}) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
          <Box sx={{
            p: 1.25, borderRadius: 2, bgcolor: iconBg, color: iconColor,
            display: "flex", flexShrink: 0,
          }}>
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {label}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "1.35rem", lineHeight: 1.3, mt: 0.25 }}>
              {value}
            </Typography>
            {sub && (
              <Typography variant="caption" color={subColor ? `${subColor}.main` : "text.secondary"}>
                {sub}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
