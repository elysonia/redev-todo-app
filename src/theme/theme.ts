"use client";
import { createTheme } from "@mui/material/styles";
const theme = createTheme({
  cssVariables: true,
  //   typography: {
  //     fontFamily: "var(--font-roboto)",
  //   },
  components: {
    MuiInput: {
      defaultProps: {
        sx: { color: "var(--foreground)" },
      },
    },
    MuiListSubheader: {
      defaultProps: {
        disableGutters: true,
        sx: {
          backgroundColor: "var(--background)",
          border: "1px solid var(--foreground)",
        },
      },
    },
    MuiListItem: {
      defaultProps: {
        disableGutters: true,
        sx: {
          padding: "4px 10px",
        },
      },
    },
    MuiCheckbox: {
      defaultProps: {
        sx: {
          svg: {
            fill: "var(--foreground)",
          },
        },
      },
    },
  },
});

export default theme;
