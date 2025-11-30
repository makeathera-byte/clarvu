"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type SummaryType = "daily" | "weekly" | "monthly" | "all";
export type DateRangePreset = "7d" | "30d" | "90d" | "custom";

export interface HistoryFiltersState {
  dateRangePreset: DateRangePreset;
  startDate: string;
  endDate: string;
  summaryType: SummaryType;
  categoryId: string | null;
  highImpactOnly: boolean;
}

interface HistoryFiltersProps {
  filters: HistoryFiltersState;
  onFiltersChange: (filters: HistoryFiltersState) => void;
  categories?: Array<{ id: string; name: string; color: string }>;
}

export function HistoryFilters({
  filters,
  onFiltersChange,
  categories = [],
}: HistoryFiltersProps) {
  const [showCustomDates, setShowCustomDates] = useState(
    filters.dateRangePreset === "custom"
  );

  const updateFilter = (key: keyof HistoryFiltersState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handlePresetChange = (preset: DateRangePreset) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = today;

    switch (preset) {
      case "7d":
        startDate.setDate(today.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(today.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(today.getDate() - 90);
        break;
      case "custom":
        setShowCustomDates(true);
        return;
    }

    setShowCustomDates(false);
    updateFilter("dateRangePreset", preset);
    updateFilter("startDate", startDate.toISOString().split("T")[0]);
    updateFilter("endDate", endDate.toISOString().split("T")[0]);
  };

  const clearFilters = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    onFiltersChange({
      dateRangePreset: "7d",
      startDate: sevenDaysAgo.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      summaryType: "all",
      categoryId: null,
      highImpactOnly: false,
    });
    setShowCustomDates(false);
  };

  const hasActiveFilters =
    filters.summaryType !== "all" ||
    filters.categoryId !== null ||
    filters.highImpactOnly ||
    filters.dateRangePreset !== "30d"; // Show clear button if not default date range

  return (
    <Card className="border-border/40">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Filters</h3>
              {/* Show active filter badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {filters.dateRangePreset !== "30d" && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.dateRangePreset === "7d" && "Last 7 Days"}
                    {filters.dateRangePreset === "90d" && "Last 90 Days"}
                    {filters.dateRangePreset === "custom" && "Custom Range"}
                  </Badge>
                )}
                {filters.summaryType !== "all" && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {filters.summaryType} Only
                  </Badge>
                )}
                {filters.categoryId && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ 
                        backgroundColor: categories.find(c => c.id === filters.categoryId)?.color || "#6b7280"
                      }}
                    />
                    {categories.find(c => c.id === filters.categoryId)?.name || "Category"}
                  </Badge>
                )}
                {filters.highImpactOnly && (
                  <Badge variant="secondary" className="text-xs">
                    High Impact Only
                  </Badge>
                )}
              </div>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Preset */}
            <div className="space-y-2">
              <Label htmlFor="date-preset" className="text-xs text-muted-foreground">
                Time Period
              </Label>
              <Select
                value={filters.dateRangePreset}
                onValueChange={(value) => handlePresetChange(value as DateRangePreset)}
              >
                <SelectTrigger id="date-preset" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Inputs */}
            {showCustomDates && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => updateFilter("startDate", e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-xs text-muted-foreground">
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => updateFilter("endDate", e.target.value)}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* Summary Type */}
            <div className="space-y-2">
              <Label htmlFor="summary-type" className="text-xs text-muted-foreground">
                Summary Type
              </Label>
              <Select
                value={filters.summaryType}
                onValueChange={(value) => updateFilter("summaryType", value as SummaryType)}
              >
                <SelectTrigger id="summary-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Summaries</SelectItem>
                  <SelectItem value="daily">Daily Only</SelectItem>
                  <SelectItem value="weekly">Weekly Only</SelectItem>
                  <SelectItem value="monthly">Monthly Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs text-muted-foreground">
                  Category
                </Label>
                <Select
                  value={filters.categoryId || "all"}
                  onValueChange={(value) =>
                    updateFilter("categoryId", value === "all" ? null : value)
                  }
                >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="All Categories">
                    {filters.categoryId ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ 
                            backgroundColor: categories.find(c => c.id === filters.categoryId)?.color || "#6b7280"
                          }}
                        />
                        <span>{categories.find(c => c.id === filters.categoryId)?.name || "Category"}</span>
                      </div>
                    ) : (
                      "All Categories"
                    )}
                  </SelectValue>
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Toggle Filters */}
          <div className="flex items-center gap-4 pt-2 border-t border-border/40">
            <div className="flex items-center gap-2">
              <Switch
                id="high-impact"
                checked={filters.highImpactOnly}
                onCheckedChange={(checked) => updateFilter("highImpactOnly", checked)}
              />
              <Label
                htmlFor="high-impact"
                className="text-xs cursor-pointer text-muted-foreground"
              >
                Show only high-impact days
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

