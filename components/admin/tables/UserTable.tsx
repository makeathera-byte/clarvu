"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users, Activity, Calendar, TrendingUp, Download, Crown } from "lucide-react";
import { isAdminEmail } from "@/lib/utils/admin";

interface UserData {
  user_id: string;
  email: string;
  name: string;
  signed_up_at: string;
  total_logs: number;
  last_active: string | null;
  summary_reads: number;
  reminders_clicked: number;
  routines_generated: number;
  total_visits: number;
}

type FilterType = "all" | "most_active" | "recently_active" | "new_users";

export function UserTable() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/admin/users?filter=${filter}&limit=500`, {
          credentials: "include",
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError("Unauthorized. Please log in as admin.");
          } else {
            setError("Failed to fetch users. Please try again.");
          }
          return;
        }

        const data = await response.json();
        if (data.success) {
          setUsers(data.data || []);
          setFilteredUsers(data.data || []);
        } else {
          setError(data.error || "Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [filter]);

  // Filter users by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query) ||
        user.user_id.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getActivityScore = (user: UserData) => {
    return user.total_logs * 2 + user.total_visits + user.summary_reads + user.routines_generated;
  };

  const formatDateForCSV = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toISOString();
  };

  const escapeCSVField = (field: string | number | null) => {
    if (field === null || field === undefined) return "";
    const str = String(field);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const exportToCSV = () => {
    if (users.length === 0) {
      alert("No users to export");
      return;
    }

    // CSV headers
    const headers = [
      "Name",
      "Email",
      "User ID",
      "Signed Up",
      "Total Logs",
      "Total Visits",
      "Summary Reads",
      "Reminders Clicked",
      "Routines Generated",
      "Last Active",
      "Activity Score",
    ];

    // Convert users data to CSV rows
    const csvRows = [
      headers.join(","),
      ...users.map((user) => {
        const activityScore = getActivityScore(user);

        return [
          escapeCSVField(user.name || "N/A"),
          escapeCSVField(user.email),
          escapeCSVField(user.user_id),
          escapeCSVField(formatDateForCSV(user.signed_up_at)),
          user.total_logs,
          user.total_visits,
          user.summary_reads,
          user.reminders_clicked,
          user.routines_generated,
          escapeCSVField(formatDateForCSV(user.last_active)),
          activityScore,
        ].join(",");
      }),
    ];

    // Create CSV content with BOM for Excel compatibility
    const BOM = "\uFEFF";
    const csvContent = BOM + csvRows.join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const today = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `dayflow-users-${today}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className="border-border/40 shadow-sm rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border/40 shadow-sm rounded-xl">
        <CardContent className="p-6">
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 shadow-sm rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({filteredUsers.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and analyze user activity
            </p>
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={users.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
            <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="most_active">Most Active</SelectItem>
              <SelectItem value="recently_active">Recently Active</SelectItem>
              <SelectItem value="new_users">New Users (7 days)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Total Users</div>
            <div className="text-lg font-semibold mt-1">{users.length}</div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Active Today</div>
            <div className="text-lg font-semibold mt-1">
              {users.filter((u) => {
                if (!u.last_active) return false;
                const lastActive = new Date(u.last_active);
                const today = new Date();
                return lastActive.toDateString() === today.toDateString();
              }).length}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Total Logs</div>
            <div className="text-lg font-semibold mt-1">
              {users.reduce((sum, u) => sum + u.total_logs, 0)}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Avg Activity</div>
            <div className="text-lg font-semibold mt-1">
              {users.length > 0
                ? Math.round(users.reduce((sum, u) => sum + getActivityScore(u), 0) / users.length)
                : 0}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Logs
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Summaries
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Routines
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No users found</p>
                      {searchQuery && (
                        <p className="text-xs mt-1">Try a different search term</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const activityScore = getActivityScore(user);
                    const isAdmin = isAdminEmail(user.email);
                    return (
                      <tr
                        key={user.user_id}
                        className={`hover:bg-muted/30 transition-colors ${
                          isAdmin 
                            ? "bg-gradient-to-r from-amber-50/80 to-amber-50/40 dark:from-amber-950/20 dark:to-amber-950/10 border-l-4 border-amber-500 dark:border-amber-400 shadow-sm" 
                            : ""
                        }`}
                      >
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className={`font-medium text-sm flex items-center gap-2 ${
                              isAdmin ? "text-amber-700 dark:text-amber-400" : ""
                            }`}>
                              {isAdmin && (
                                <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                              )}
                              <span>{user.name !== "N/A" ? user.name : "—"}</span>
                              {isAdmin && (
                                <Badge 
                                  variant="outline" 
                                  className="ml-1 text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20"
                                >
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <div className={`text-xs truncate max-w-[200px] flex items-center gap-1 ${
                              isAdmin ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"
                            }`}>
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                activityScore > 50
                                  ? "default"
                                  : activityScore > 20
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              <Activity className="h-3 w-3 mr-1" />
                              {activityScore}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {user.total_visits} visits
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium">{user.total_logs}</div>
                          {user.reminders_clicked > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {user.reminders_clicked} reminders
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{user.summary_reads}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{user.routines_generated}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDate(user.last_active)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-xs text-muted-foreground">
                            {new Date(user.signed_up_at).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
