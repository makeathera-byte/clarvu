import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clarvu - Productivity & Deep Work Analytics for Business Owners",
  description: "Clarvu — Productivity, focus, and deep work analytics designed for business owners who want to maximize their time.",
};

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <Suspense fallback={<LoadingFallback />}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
