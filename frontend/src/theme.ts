import { createTheme } from "@mui/material/styles";

/** The app's look in one place: colours, font, corner roundness and a few component defaults. */
export const theme = createTheme({
  palette: {
    primary: { main: "#0f766e" },
    secondary: { main: "#4f46e5" },
    background: { default: "#f5f7f8", paper: "#ffffff" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: "2rem", fontWeight: 700 },
    h2: { fontSize: "1.5rem", fontWeight: 700 },
    h3: { fontSize: "1.25rem", fontWeight: 600 },
  },
  components: {
    // Normal-case button labels read better than MUI's default ALL CAPS.
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
    MuiCard: { defaultProps: { variant: "outlined" } },
  },
});
