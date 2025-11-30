import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message: string;
  details?: string;
  className?: string;
}

/**
 * Generic error message component
 * Used for displaying errors consistently across the app
 */
export function ErrorMessage({
  title = "Error",
  message,
  details,
  className = "",
}: ErrorMessageProps) {
  return (
    <Card className={`border-red-200 bg-red-50 dark:bg-red-900/20 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              {title}
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
            {details && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">{details}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

