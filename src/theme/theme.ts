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
        style: { color: "var(--foreground)" },
      },
    },
  },
});

export default theme;
