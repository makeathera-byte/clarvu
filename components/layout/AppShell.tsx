import { ReactNode } from "react";
import { Navbar } from "./navbar";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * AppShell - Consistent layout wrapper for all pages
 * Provides navbar, consistent spacing, and background
 */
export function AppShell({ children, className = "" }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className={className}>{children}</div>
      </main>
    </div>
  );
}

