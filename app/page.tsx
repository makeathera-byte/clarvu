import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        {/* Main Heading */}
        <h1 className="mb-6 animate-fade-in text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
          DayFlow
          </h1>
        
        {/* Subtitle */}
        <p className="mb-12 animate-fade-in text-xl text-muted-foreground sm:text-2xl" style={{ animationDelay: "0.1s" }}>
          Track your day. Understand your patterns.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            asChild
            size="lg"
            className="animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
        </div>

        {/* Optional Feature Cards */}
        <div className="mt-24 grid gap-6 sm:grid-cols-2">
          <Card className="border-border/40 p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
            <h3 className="mb-2 text-lg font-semibold">Activity Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Log your daily activities and see patterns emerge over time.
            </p>
          </Card>
          <Card className="border-border/40 p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
            <h3 className="mb-2 text-lg font-semibold">Insights & Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Understand your habits and make data-driven decisions.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
