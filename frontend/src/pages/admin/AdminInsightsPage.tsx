import { useEffect, useState } from "react";
import {
  Alert, Box, Card, CardContent, Chip, CircularProgress, Divider,
  Grid, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from "@mui/material";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { api } from "../../api/client";
import type { AdminInsights } from "../../types/api";

export function AdminInsightsPage() {
  const [data, setData] = useState<AdminInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<AdminInsights>("/admin/insights")
      .then(setData)
      .catch(() => setError("Failed to load insights."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: "grid", placeItems: "center", py: 10 }}><CircularProgress /></Box>;
  if (error)   return <Alert severity="error">{error}</Alert>;
  if (!data)   return null;

  return (
    <Box>
      <Typography variant="h2" mb={4}>Platform Insights</Typography>

      <Grid container spacing={2.5} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<PeopleOutlinedIcon />} iconBg="#e3f2fd" iconColor="#1565c0"
            label="Total users" value={data.totalUsers} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<ReceiptLongOutlinedIcon />} iconBg="#e8f5e9" iconColor="#2e7d32"
            label="Total expenses" value={data.totalExpenses} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<AttachMoneyIcon />} iconBg="#fff8e1" iconColor="#f57f17"
            label="Total value" value={`$${data.totalValue.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<CalendarTodayOutlinedIcon />} iconBg="#fce4ec" iconColor="#c62828"
            label="Expenses this month" value={data.expensesThisMonth} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} mb={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h3" mb={2.5}>Spending per category</Typography>
              <Stack spacing={2}>
                {data.spendingPerCategory.map((c) => (
                  <Stack key={c.categoryId} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">{c.name}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>${c.total.toFixed(2)}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h3" mb={2.5}>Top 5 categories</Typography>
              <Stack spacing={2}>
                {data.topCategories.map((c, i) => (
                  <Stack key={c.categoryId} direction="row" alignItems="center">
                    <Typography variant="caption" color="text.disabled" sx={{ minWidth: 24 }}>
                      #{i + 1}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }}>{c.name}</Typography>
                    <Chip label={`${c.count} expenses`} size="small" color="primary" variant="outlined" sx={{ minWidth: 90, justifyContent: "center" }} />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h3" mb={2.5}>Bottom 5 categories</Typography>
              <Stack spacing={2}>
                {data.bottomCategories.map((c, i) => (
                  <Stack key={c.categoryId} direction="row" alignItems="center">
                    <Typography variant="caption" color="text.disabled" sx={{ minWidth: 24 }}>
                      #{i + 1}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }}>{c.name}</Typography>
                    <Chip label={`${c.count} expenses`} size="small" variant="outlined" sx={{ minWidth: 90, justifyContent: "center" }} />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h3" mb={2.5}>Recent expenses</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell>Title</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentExpenses.map((exp) => (
                      <TableRow key={exp.id} hover>
                        <TableCell>{exp.title}</TableCell>
                        <TableCell>{exp.user.name}</TableCell>
                        <TableCell>
                          <Chip label={exp.category.name} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ${exp.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{exp.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h3" mb={2.5}>Recent users</Typography>
              <Stack divider={<Divider />} spacing={0}>
                {data.recentUsers.map((u) => (
                  <Stack key={u.id} direction="row" justifyContent="space-between"
                    alignItems="center" sx={{ py: 1.5 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{u.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                    </Box>
                    <Chip
                      label={u.role}
                      size="small"
                      color={u.role === "admin" ? "secondary" : "default"}
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function StatCard({ icon, iconBg, iconColor, label, value }: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 1.5 }}>
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: iconBg, color: iconColor, display: "flex" }}>
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Stack>
        <Typography sx={{ fontWeight: 700, fontSize: "1.5rem" }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}
