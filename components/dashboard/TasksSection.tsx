"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateTaskBanner } from "@/components/activity/CreateTaskBanner";
import { TodaysTasksBanner } from "@/components/activity/TodaysTasksBanner";
import type { ActivityLog } from "@/lib/types";

interface TasksSectionProps {
  initialTasks: ActivityLog[];
}

/**
 * Client component for managing tasks
 * Handles task creation and displays today's tasks
 */
export function TasksSection({ initialTasks }: TasksSectionProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<ActivityLog[]>(initialTasks);
  const [loading, setLoading] = useState(false);

  // Refresh tasks when initialTasks change
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleCreateTask = async (data: {
    activity: string;
    category_id: string;
    duration_minutes: number;
    startNow?: boolean;
  }) => {
    setLoading(true);
    try {
      const response = await fetch("/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: data.activity,
          category_id: data.category_id,
          duration_minutes: data.duration_minutes,
          start_time: new Date().toISOString(), // Use current time
          startNow: data.startNow || false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create task");
      }

      // Refresh the page to get updated tasks
      router.refresh();
    } catch (error: any) {
      console.error("Failed to create task:", error);
      throw error; // Re-throw so CreateTaskBanner can handle it
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (taskId: string) => {
    // Navigate to task details or open timer
    console.log("Task clicked:", taskId);
    // You can add navigation logic here
  };

  return (
    <div className="space-y-4">
      {/* Create Task Banner - Always on top */}
      <CreateTaskBanner onCreateTask={handleCreateTask} />
      
      {/* Today's Tasks Banner */}
      {tasks.length > 0 && (
        <TodaysTasksBanner tasks={tasks} onTaskClick={handleTaskClick} />
      )}
    </div>
  );
}

