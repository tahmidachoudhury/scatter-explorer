import { createTheme } from "@mui/material/styles";

// Single source of truth for the palette so MUI components match the
// scatterplot's accent (#5b8cff) and light "matlab" background.
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#5b8cff" },
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: "#4d4d4d", secondary: "#6b6b6b" },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
});
