import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message: string;
  className?: string;
}

/**
 * Generic empty state component
 * Used for displaying friendly empty states across the app
 */
export function EmptyState({
  icon: Icon,
  title,
  message,
  className = "",
}: EmptyStateProps) {
  return (
    <Card className={`border-border/40 bg-muted/30 ${className}`}>
      <CardContent className="p-8 text-center">
        {Icon && (
          <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

