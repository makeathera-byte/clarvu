"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Activity, 
  HeartPulse,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/ppadminpp", label: "Overview", icon: LayoutDashboard },
  { href: "/ppadminpp/traffic", label: "Traffic", icon: TrendingUp },
  { href: "/ppadminpp/users", label: "Users", icon: Users },
  { href: "/ppadminpp/usage", label: "Usage", icon: Activity },
  { href: "/ppadminpp/health", label: "System Health", icon: HeartPulse },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card/50 dark:bg-card/80 backdrop-blur-sm transition-colors">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
        </div>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== "/ppadminpp" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm dark:shadow-md"
                  : "text-muted-foreground hover:bg-muted/50 dark:hover:bg-muted/30 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

