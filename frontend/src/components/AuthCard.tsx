import type { ReactNode } from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Shown under the form, for example a link to the other auth page. */
  footer?: ReactNode;
}

/** This is the centre card for both sign-in and sign-up pages. On phones, it will be full width, on larger screens, it will be fixed width. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2, py: 4 }}>
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1} sx={{ alignItems: "center", mb: 3, textAlign: "center" }}>
            <Typography variant="h1" component="h1">
              {title}
            </Typography>
            <Typography color="text.secondary">{subtitle}</Typography>
          </Stack>
          {children}
          {footer && <Box sx={{ mt: 3, textAlign: "center" }}>{footer}</Box>}
        </CardContent>
      </Card>
    </Box>
  );
}
