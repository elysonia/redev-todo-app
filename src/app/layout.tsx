import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StrictMode } from "react";

import TodoStoreProvider from "@providers/TodoStoreProvider";
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
  title: "Taskeep",
  description:
    "Create, manage, and track tasks with ease using this simple intuitive task management app.",
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
        <StrictMode>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <TodoStoreProvider>{children}</TodoStoreProvider>
            </ThemeProvider>
          </AppRouterCacheProvider>
          <SpeedInsights />
        </StrictMode>
      </body>
    </html>
  );
}
