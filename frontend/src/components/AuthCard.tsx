import type { ReactNode } from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Shown under the form, for example a link to the other auth page. */
  footer?: ReactNode;
}

/** The centred card shared by the sign-in and sign-up pages. Full width on phones, fixed width on larger screens. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2, py: 4 }}>
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1} sx={{ alignItems: "center", mb: 3, textAlign: "center" }}>
            <SavingsOutlinedIcon color="primary" sx={{ fontSize: 40 }} />
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
