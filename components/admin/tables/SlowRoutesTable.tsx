"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SlowRoute {
  event: string;
  value: number;
  created_at: string;
  user_id?: string | null;
}

interface SlowRoutesTableProps {
  data: SlowRoute[];
}

export function SlowRoutesTable({ data }: SlowRoutesTableProps) {
  if (data.length === 0) {
    return (
      <Card className="border-border/40 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Slow API Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground p-6">
            No slow routes detected
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg">Slow API Routes (&gt;1s)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Route/Event</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Response Time</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.map((route, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-sm font-mono text-foreground">{route.event || "Unknown"}</td>
                  <td className="p-3 text-sm">
                    <span className={`font-medium ${
                      route.value > 5000 ? "text-destructive dark:text-red-400" :
                      route.value > 2000 ? "text-orange-500 dark:text-orange-400" :
                      "text-yellow-500 dark:text-yellow-400"
                    }`}>
                      {(route.value / 1000).toFixed(2)}s
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({route.value}ms)
                    </span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(route.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

