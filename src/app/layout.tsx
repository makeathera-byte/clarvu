import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Clarvu — See Where Your Time Actually Goes",
  description: "Clarvu helps business owners track focus, eliminate wasted time, and build real productivity with clarity.",
  icons: {
    icon: '/clarvu-icon.png',
    apple: '/icon-512.png',
  },
  manifest: '/manifest.json',
  themeColor: '#0b0b0b',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Clarvu',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
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
          className={`${inter.variable} ${lora.variable} font-sans antialiased`}
        >
          <Suspense fallback={<LoadingFallback />}>
            <ThemeProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
              <Toaster position="bottom-right" theme="system" />
            </ThemeProvider>
          </Suspense>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    );
  } catch (error) {
    console.error('Error in RootLayout:', error);
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${lora.variable} font-sans antialiased`}>
          <ErrorFallback error={error instanceof Error ? error : new Error('Unknown error')} />
        </body>
      </html>
    );
  }
}
