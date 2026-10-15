// TEMPORARY: stands in for pages that are not built yet. Each route switches to its real page as it is built.
import { Link as RouterLink } from "react-router";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useAuth } from "../hooks/useAuth";

export function PlaceholderPage({ title }: { title: string }) {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 640, mx: "auto" }}>
      <Card>
        <CardContent>
          <Typography variant="h1" gutterBottom>
            {title}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            This page is coming soon. Signed in as {user?.name} ({user?.role}).
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
            <Button component={RouterLink} to="/dashboard" variant="outlined">
              Dashboard
            </Button>
            <Button component={RouterLink} to="/admin" variant="outlined">
              Admin
            </Button>
            <Button onClick={logout} color="error">
              Log out
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
