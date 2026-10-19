import { Card, CardContent, Typography } from "@mui/material";

interface StatCardProps {
  label: string;
  /** The big figure, e.g. "$120.00" or a count. */
  value: string | number;
  /** Optional small line under the figure. */
  sub?: string;
  /** Colours the sub line, e.g. "error" when over budget. */
  subColor?: "success" | "warning" | "error" | "inherit";
}

/** A summary card with a label, a big figure and an optional note. Used on the user and admin dashboards. */
export function StatCard({ label, value, sub, subColor }: StatCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
