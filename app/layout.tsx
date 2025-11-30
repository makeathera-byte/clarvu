import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavbarClient } from "@/components/layout/navbar-client";
import { EnvBanner } from "@/components/layout/env-banner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeSync } from "@/components/layout/ThemeSync";
import { ErrorBoundary } from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DayFlow - Track your day. Understand your patterns.",
    template: "%s | DayFlow",
  },
  description: "DayFlow - Track your day. Understand your patterns. A productivity tracking app with AI-powered insights.",
  keywords: ["productivity", "time tracking", "activity logging", "AI insights", "time management"],
  authors: [{ name: "DayFlow Team" }],
  creator: "DayFlow",
  publisher: "DayFlow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dayflow.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "DayFlow",
    title: "DayFlow - Track your day. Understand your patterns.",
    description: "A productivity tracking app with AI-powered insights.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DayFlow - Track your day. Understand your patterns.",
    description: "A productivity tracking app with AI-powered insights.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeSync />
            <div className="min-h-screen bg-background transition-colors">
              <EnvBanner />
              <NavbarClient />
              <main className="transition-all duration-300 ease-in-out">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
