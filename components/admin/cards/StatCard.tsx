import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  subtitle?: string;
}

export function StatCard({ title, value, change, subtitle }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const hasChange = change !== undefined && !isNaN(change);

  return (
    <Card className="border-border/40 shadow-sm rounded-xl bg-gradient-to-br from-card to-card/50">
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{value.toLocaleString()}</p>
            {hasChange && (
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(change).toFixed(1)}%</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

