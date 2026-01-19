import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";
import { ServiceWorkerRegistration } from "@/components/pwa";
import { PWALoadingScreen } from "@/components/pwa/PWALoadingScreen";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://clarvu.com'),
  title: {
    default: "Clarvu — Productivity Tracker for Business Owners",
    template: "%s | Clarvu",
  },
  description: "Track focus, eliminate wasted time, and build real productivity. Clarvu helps business owners with deep work analytics, AI insights, and time tracking that actually works.",
  keywords: [
    'productivity tracker',
    'time tracking app',
    'focus tracking software',
    'productivity app for business owners',
    'deep work tracker',
    'time management app',
    'focus session timer',
    'productivity analytics',
    'AI productivity coach',
    'business productivity tool',
    'eliminate wasted time',
    'focus analytics',
    'productivity insights',
    'task tracking',
    'productivity score',
  ],
  authors: [{ name: 'Clarvu Team' }],
  creator: 'Clarvu',
  publisher: 'Clarvu',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/clarvu-icon.png',
    apple: '/icon-512.png',
    shortcut: '/clarvu-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Clarvu',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://clarvu.com',
    siteName: 'Clarvu',
    title: 'Clarvu — Productivity Tracker for Business Owners',
    description: 'Track focus, eliminate wasted time, and build real productivity. Deep work analytics, AI insights, and time tracking that actually works.',
    images: [
      {
        url: '/dashboard_preview_hero_1765838464750.png',
        width: 1200,
        height: 630,
        alt: 'Clarvu Dashboard - Productivity Tracking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clarvu — Productivity Tracker for Business Owners',
    description: 'Track focus, eliminate wasted time, and build real productivity with clarity.',
    images: ['/dashboard_preview_hero_1765838464750.png'],
    creator: '@clarvu',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://clarvu.com',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0b0b0b',
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
          <PWALoadingScreen />
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
          <ServiceWorkerRegistration />
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
