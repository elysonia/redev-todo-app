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
    MuiCheckbox: {
      defaultProps: {
        sx: {
          "&.Mui-disabled": {
            svg: { fill: "rgb(from var(--foreground) r g b / 0.4 )" },
          },
          "&.Mui-checked": {
            svg: {
              fill: "rgb(from var(--foreground) abs(calc(r - 150)) abs(calc(g - 100)) abs(calc(b - 100)) / 0.8 )",
            },
          },
          svg: {
            fill: "var(--foreground)",
          },
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        sx: {
          svg: {
            fill: "var(--foreground)",
          },
        },
      },
    },

    MuiButton: {
      defaultProps: {
        sx: {
          textTransform: "capitalize",
          fontSize: "1rem",
          svg: {
            fill: "var(--foreground)",
          },
        },
      },
    },
  },
});

export default theme;
