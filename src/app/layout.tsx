import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import TodoStoreProvider from "@todoApp/providers/TodoStoreProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import theme from "../theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Re:Dev",
  description:
    "what if you isekaid from your previous life as a dev to a new life...as a dev.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <TodoStoreProvider>{children}</TodoStoreProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
