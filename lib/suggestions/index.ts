"use client";

import { createClient } from "@/lib/supabase/client";

// Local built-in suggestions (common tasks)
const LOCAL_SUGGESTIONS = [
  "Work",
  "Meeting",
  "Coding",
  "Reading",
  "Writing",
  "Exercise",
  "Break",
  "Lunch",
  "Dinner",
  "Email",
  "Planning",
  "Research",
  "Design",
  "Review",
  "Social",
  "Entertainment",
  "Learning",
  "Sleep",
];

// Simple fuzzy match function
function fuzzyMatch(query: string, text: string): boolean {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match
  if (textLower.includes(queryLower)) return true;
  
  // First letters match
  if (textLower.split(" ").some(word => word.startsWith(queryLower))) return true;
  
  // Character sequence match
  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === queryLower.length;
}

// Get user-specific suggestions from activity history
async function getUserSuggestions(): Promise<string[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    // Get last 50 activity logs
    const { data } = await supabase
      .from("activity_logs")
      .select("activity")
      .eq("user_id", user.id)
      .not("activity", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!data) return [];

    // Extract unique activities
    const activities = new Set<string>();
    data.forEach((log: { activity?: string | null }) => {
      if (log.activity) {
        activities.add(log.activity);
      }
    });

    return Array.from(activities);
  } catch (error) {
    console.error("Error fetching user suggestions:", error);
    return [];
  }
}

// Main suggestion function
export async function getSuggestions(query: string): Promise<string[]> {
  // Don't suggest if query is too short
  if (!query || query.length < 1) {
    return [];
  }

  const queryLower = query.trim().toLowerCase();
  
  // Combine local and user suggestions
  const allSuggestions = [
    ...LOCAL_SUGGESTIONS,
    ...(await getUserSuggestions()),
  ];

  // Remove duplicates
  const uniqueSuggestions = Array.from(new Set(allSuggestions));

  // Filter and rank suggestions
  const matched: Array<{ text: string; score: number }> = [];

  uniqueSuggestions.forEach(suggestion => {
    if (fuzzyMatch(queryLower, suggestion)) {
      const suggestionLower = suggestion.toLowerCase();
      
      // Calculate score (higher = better match)
      let score = 0;
      
      // Exact match gets highest score
      if (suggestionLower === queryLower) {
        score = 100;
      }
      // Starts with query
      else if (suggestionLower.startsWith(queryLower)) {
        score = 80;
      }
      // Contains query
      else if (suggestionLower.includes(queryLower)) {
        score = 60;
      }
      // Fuzzy match
      else {
        score = 40;
      }
      
      matched.push({ text: suggestion, score });
    }
  });

  // Sort by score (highest first)
  matched.sort((a, b) => b.score - a.score);

  // Return top 8 suggestions
  return matched.slice(0, 8).map(item => item.text);
}

// Quick sync version for immediate suggestions (uses only local)
export function getQuickSuggestions(query: string): string[] {
  if (!query || query.length < 1) {
    return [];
  }

  const queryLower = query.trim().toLowerCase();
  const matched: Array<{ text: string; score: number }> = [];

  LOCAL_SUGGESTIONS.forEach(suggestion => {
    if (fuzzyMatch(queryLower, suggestion)) {
      const suggestionLower = suggestion.toLowerCase();
      let score = 0;
      
      if (suggestionLower === queryLower) {
        score = 100;
      } else if (suggestionLower.startsWith(queryLower)) {
        score = 80;
      } else if (suggestionLower.includes(queryLower)) {
        score = 60;
      } else {
        score = 40;
      }
      
      matched.push({ text: suggestion, score });
    }
  });

  matched.sort((a, b) => b.score - a.score);
  return matched.slice(0, 8).map(item => item.text);
}

