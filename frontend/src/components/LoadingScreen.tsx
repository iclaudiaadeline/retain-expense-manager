import { Box, CircularProgress } from "@mui/material";


/** A centered spinner which takes up the entire screen when the app is verifying the user is signed in or not. */
export function LoadingScreen() {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }} role="status" aria-label="Loading">
      <CircularProgress />
    </Box>
  );
}
