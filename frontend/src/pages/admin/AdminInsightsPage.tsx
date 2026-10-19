import { useEffect, useState } from "react";
import {
  Alert, Box, Card, CardContent, Chip, CircularProgress, Divider,
  Grid, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from "@mui/material";
import { api } from "../../api/client";
import type { AdminInsights } from "../../types/api";

/** "1 expense", "3 expenses" */
function expenseCountLabel(count: number) {
  return `${count} ${count === 1 ? "expense" : "expenses"}`;
}

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
      <Typography variant="h2" sx={{ mb: 4 }}>Platform Insights</Typography>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total users" value={data.totalUsers} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total expenses" value={data.totalExpenses} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total value" value={`$${data.totalValue.toFixed(2)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Expenses this month" value={data.expensesThisMonth} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h3" sx={{ mb: 2.5 }}>Spending per category</Typography>
              <Stack spacing={2}>
                {data.spendingPerCategory.map((c) => (
                  <Stack key={c.categoryId} direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
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
              <Typography variant="h3" sx={{ mb: 2.5 }}>Top 5 categories</Typography>
              <Stack spacing={2}>
                {data.topCategories.map((c, i) => (
                  <Stack key={c.categoryId} direction="row" sx={{ alignItems: "center" }}>
                    <Typography variant="caption" color="text.disabled" sx={{ minWidth: 24 }}>
                      #{i + 1}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }}>{c.name}</Typography>
                    <Chip label={expenseCountLabel(c.count)} size="small" color="primary" variant="outlined" sx={{ minWidth: 90, justifyContent: "center" }} />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h3" sx={{ mb: 2.5 }}>Bottom 5 categories</Typography>
              <Stack spacing={2}>
                {data.bottomCategories.map((c, i) => (
                  <Stack key={c.categoryId} direction="row" sx={{ alignItems: "center" }}>
                    <Typography variant="caption" color="text.disabled" sx={{ minWidth: 24 }}>
                      #{i + 1}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }}>{c.name}</Typography>
                    <Chip label={expenseCountLabel(c.count)} size="small" variant="outlined" sx={{ minWidth: 90, justifyContent: "center" }} />
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
              <Typography variant="h3" sx={{ mb: 2.5 }}>Recent expenses</Typography>
              {data.recentExpenses.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No expenses recorded yet.</Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.50" }}>
                        <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
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
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h3" sx={{ mb: 2.5 }}>Recent users</Typography>
              <Stack divider={<Divider />} spacing={0}>
                {data.recentUsers.map((u) => (
                  <Stack key={u.id} direction="row" sx={{ justifyContent: "space-between", alignItems: "center", py: 1.5 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{u.name}</Typography>
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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{label}</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: "1.5rem" }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}
