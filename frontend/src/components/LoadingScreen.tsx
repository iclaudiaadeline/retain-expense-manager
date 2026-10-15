import { Box, CircularProgress } from "@mui/material";

/** A centred spinner that fills the screen, shown while the app is checking who is signed in. */
export function LoadingScreen() {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }} role="status" aria-label="Loading">
      <CircularProgress />
    </Box>
  );
}
