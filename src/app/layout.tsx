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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Application Error</h1>
        <p className="text-muted-foreground">
          {process.env.NODE_ENV === 'development'
            ? error.message
            : 'An error occurred while loading the application.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
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
  } catch (error) {
    console.error('Error in RootLayout:', error);
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <ErrorFallback error={error instanceof Error ? error : new Error('Unknown error')} />
        </body>
      </html>
    );
  }
}
