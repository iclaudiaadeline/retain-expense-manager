import { useEffect, useState } from "react";
import {
  Alert, Box, Card, CardContent, Chip, CircularProgress,
  Grid, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Paper,
} from "@mui/material";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
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

  if (loading) return <Box sx={{ display: "grid", placeItems: "center", py: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  return (
    <Box>
      <Typography variant="h2" mb={3}>Platform Insights</Typography>

      {/* Top stats */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<PeopleOutlineIcon color="primary" />} label="Total users" value={data.totalUsers} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<ReceiptLongOutlinedIcon color="primary" />} label="Total expenses" value={data.totalExpenses} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<AttachMoneyIcon color="primary" />} label="Total value" value={`$${data.totalValue.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={<CalendarTodayOutlinedIcon color="primary" />} label="This month" value={data.expensesThisMonth} />
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={3}>
        {/* Spending per category */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h3" mb={2}>Spending per category</Typography>
              <Stack spacing={1}>
                {data.spendingPerCategory.map((c) => (
                  <Stack key={c.categoryId} direction="row" justifyContent="space-between">
                    <Typography variant="body2">{c.name}</Typography>
                    <Typography variant="body2" fontWeight={600}>${c.total.toFixed(2)}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Top 5 categories */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h3" mb={2}>Top 5 categories</Typography>
              <Stack spacing={1}>
                {data.topCategories.map((c, i) => (
                  <Stack key={c.categoryId} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary">#{i + 1}</Typography>
                      <Typography variant="body2">{c.name}</Typography>
                    </Stack>
                    <Chip label={`${c.count} expenses`} size="small" color="primary" variant="outlined" />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Bottom 5 categories */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h3" mb={2}>Bottom 5 categories</Typography>
              <Stack spacing={1}>
                {data.bottomCategories.map((c, i) => (
                  <Stack key={c.categoryId} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary">#{i + 1}</Typography>
                      <Typography variant="body2">{c.name}</Typography>
                    </Stack>
                    <Chip label={`${c.count} expenses`} size="small" variant="outlined" />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Recent expenses */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h3" mb={2}>Recent expenses</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
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
                        <TableCell><Chip label={exp.category.name} size="small" /></TableCell>
                        <TableCell align="right">${exp.amount.toFixed(2)}</TableCell>
                        <TableCell>{exp.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent users */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h3" mb={2}>Recent users</Typography>
              <Stack spacing={1.5}>
                {data.recentUsers.map((u) => (
                  <Stack key={u.id} direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{u.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                    </Box>
                    <Chip label={u.role} size="small" color={u.role === "admin" ? "secondary" : "default"} />
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

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
          {icon}
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Stack>
        <Typography variant="h2">{value}</Typography>
      </CardContent>
    </Card>
  );
}
