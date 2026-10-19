import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#0f766e" },
    secondary: { main: "#4f46e5" },
    background: { default: "#f0f2f5", paper: "#ffffff" },
  },
  shape: { borderRadius: 10 },
  spacing: 8,
  typography: {
    fontFamily: '"Inter", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: "1.875rem", fontWeight: 700, lineHeight: 1.3 },
    h2: { fontSize: "1.375rem", fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: "1.1rem",   fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem",  lineHeight: 1.6 },
    caption: { fontSize: "0.8rem",  lineHeight: 1.5 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
        sizeLarge:  { padding: "10px 24px" },
        sizeMedium: { padding: "8px 20px" },
        sizeSmall:  { padding: "5px 14px" },
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: 12 } },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          "&:last-child": { paddingBottom: "24px" },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "13px 16px" },
        head: { fontWeight: 600, fontSize: "0.8125rem", color: "#6b7280", backgroundColor: "#f9fafb" },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { "&:last-child td": { borderBottom: 0 } },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
        sizeSmall: { height: 22, fontSize: "0.75rem" },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: "#e5e7eb" } },
    },
    MuiPaper: {
      styleOverrides: { outlined: { borderColor: "#e5e7eb" } },
    },
    // White top navbar
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#111827",
        },
      },
    },
  },
});
