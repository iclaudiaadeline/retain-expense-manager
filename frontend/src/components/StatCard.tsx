import { Card, CardContent, Typography } from "@mui/material";

interface StatCardProps {
  label: string;
  /** the main value displayed on the card, such as an amount or a count. */
  value: string | number;
  /** An optional note displayed below the main value. */
  sub?: string;
  /** sets the note's color, for example, red when over budget. */
  subColor?: "success" | "warning" | "error" | "inherit";
}

/** Displays a summary cards with a title, value, and optional note on the dashboard. */
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
