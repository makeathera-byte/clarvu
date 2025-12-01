"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Settings, User, LogOut, Mail, Crown } from "lucide-react";
import { isAdminEmail } from "@/lib/utils/admin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavbarClient() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const supabase = createClient();
      
      // Check if Supabase is properly configured by checking if getUser exists
      if (supabase?.auth?.getUser) {
        supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
          setUser(user);
        }).catch(() => {
          // Silently handle errors if Supabase is not configured
        });

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
          setUser(session?.user ?? null);
        });

        return () => {
          if (subscription) {
            subscription.unsubscribe();
          }
        };
      }
    } catch (error) {
      // Silently handle errors - env vars might not be set up yet
      console.warn("Supabase client initialization error:", error);
    }
  }, []);

  // Hide navbar on admin pages (check after all hooks are called)
  if (pathname?.startsWith("/ppadminpp")) {
    return null;
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      if (supabase?.auth?.signOut) {
        await supabase.auth.signOut();
      }
      router.push("/");
      router.refresh();
    } catch (error) {
      // If Supabase isn't configured, just navigate
      router.push("/");
      router.refresh();
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/history", label: "History" },
  ];

  return (
    <nav className="w-full border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo/Brand and Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xl font-semibold text-foreground transition-all duration-300 hover:text-foreground/80 hover:scale-105"
          >
            DayFlow
          </Link>

          {user && (
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-all duration-300",
                      "rounded-xl px-4 py-2 hover:bg-muted/50",
                      isActive
                        ? "text-foreground bg-muted/30"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user && (
            <>
              {/* Settings Icon */}
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-xl h-9 w-9 p-0",
                    pathname === "/settings"
                      ? "bg-muted/30 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>

              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl h-9 w-9 p-0"
                    title="Account"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Account</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdminEmail(user.email) && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/ppadminpp" className="cursor-pointer">
                          <Crown className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <span className="font-medium">Admin Portal</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {!user && (
            <Link href="/auth/login">
              <Button variant="default" size="sm" className="rounded-xl">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
