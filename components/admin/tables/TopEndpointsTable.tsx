"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Endpoint {
  endpoint: string;
  count: number;
}

interface TopEndpointsTableProps {
  data: Endpoint[];
}

export function TopEndpointsTable({ data }: TopEndpointsTableProps) {
  if (data.length === 0) {
    return (
      <Card className="border-border/40 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Top API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground p-6">
            No endpoint data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg">Top API Endpoints (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Endpoint</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Requests</th>
              </tr>
            </thead>
            <tbody>
              {data.map((endpoint, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-sm font-mono text-foreground">{endpoint.endpoint}</td>
                  <td className="p-3 text-sm font-medium text-foreground">{endpoint.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

