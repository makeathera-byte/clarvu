/**
 * Context Detector Engine
 * Lightweight, AI-free prediction engine for task detection
 * Uses URL patterns and tab titles to infer likely activities
 */

export interface DetectedContext {
  likelyTask: string | null;
  categoryId: string | null;
  confidence: number; // 0-100
  reason: string;
}

/**
 * Detect likely task from active tab title
 * Pure pattern matching - no AI required
 */
export function detectLikelyTask(activeTab: string, idleState: boolean): DetectedContext {
  if (idleState) {
    return {
      likelyTask: null,
      categoryId: null,
      confidence: 0,
      reason: "User is idle",
    };
  }

  const tabLower = activeTab.toLowerCase();

  // Coding/Development
  if (
    tabLower.includes("github") ||
    tabLower.includes("gitlab") ||
    tabLower.includes("stack overflow") ||
    tabLower.includes("codepen") ||
    tabLower.includes("codesandbox") ||
    tabLower.includes("vscode") ||
    tabLower.includes("visual studio code") ||
    tabLower.includes("code editor")
  ) {
    return {
      likelyTask: "Coding",
      categoryId: null, // Will map to category by name
      confidence: 75,
      reason: "Detected coding environment",
    };
  }

  // Email
  if (
    tabLower.includes("gmail") ||
    tabLower.includes("outlook") ||
    tabLower.includes("mail") ||
    tabLower.includes("email") ||
    tabLower.includes("yahoo mail")
  ) {
    return {
      likelyTask: "Email Work",
      categoryId: null,
      confidence: 70,
      reason: "Detected email client",
    };
  }

  // Documentation/Writing
  if (
    tabLower.includes("docs.google") ||
    tabLower.includes("google docs") ||
    tabLower.includes("notion") ||
    tabLower.includes("confluence") ||
    tabLower.includes("word") ||
    tabLower.includes("document") ||
    tabLower.includes("writing")
  ) {
    return {
      likelyTask: "Writing / Documentation",
      categoryId: null,
      confidence: 70,
      reason: "Detected document/writing tool",
    };
  }

  // Spreadsheets/Admin
  if (
    tabLower.includes("sheets.google") ||
    tabLower.includes("excel") ||
    tabLower.includes("spreadsheet") ||
    tabLower.includes("admin")
  ) {
    return {
      likelyTask: "Admin Work",
      categoryId: null,
      confidence: 65,
      reason: "Detected admin/spreadsheet tool",
    };
  }

  // Planning/Notes
  if (
    tabLower.includes("notion") ||
    tabLower.includes("obsidian") ||
    tabLower.includes("evernote") ||
    tabLower.includes("onenote") ||
    tabLower.includes("notes") ||
    tabLower.includes("planning")
  ) {
    return {
      likelyTask: "Planning / Notes",
      categoryId: null,
      confidence: 65,
      reason: "Detected note-taking/planning tool",
    };
  }

  // Video/Entertainment
  if (
    tabLower.includes("youtube") ||
    tabLower.includes("vimeo") ||
    tabLower.includes("netflix") ||
    tabLower.includes("twitch") ||
    tabLower.includes("streaming")
  ) {
    return {
      likelyTask: "Watching Videos",
      categoryId: null,
      confidence: 80,
      reason: "Detected video platform",
    };
  }

  // Social Media
  if (
    tabLower.includes("facebook") ||
    tabLower.includes("twitter") ||
    tabLower.includes("x.com") ||
    tabLower.includes("instagram") ||
    tabLower.includes("linkedin") ||
    tabLower.includes("reddit") ||
    tabLower.includes("tiktok")
  ) {
    return {
      likelyTask: "Social Media",
      categoryId: null,
      confidence: 75,
      reason: "Detected social media platform",
    };
  }

  // Meetings/Calls
  if (
    tabLower.includes("zoom") ||
    tabLower.includes("meet") ||
    tabLower.includes("teams") ||
    tabLower.includes("webex") ||
    tabLower.includes("call") ||
    tabLower.includes("meeting")
  ) {
    return {
      likelyTask: "Meeting / Call",
      categoryId: null,
      confidence: 70,
      reason: "Detected meeting/call platform",
    };
  }

  // Design
  if (
    tabLower.includes("figma") ||
    tabLower.includes("adobe") ||
    tabLower.includes("canva") ||
    tabLower.includes("sketch") ||
    tabLower.includes("design")
  ) {
    return {
      likelyTask: "Design Work",
      categoryId: null,
      confidence: 70,
      reason: "Detected design tool",
    };
  }

  // No match
  return {
    likelyTask: null,
    categoryId: null,
    confidence: 0,
    reason: "No pattern match found",
  };
}

/**
 * Detect category from context/task name
 * Returns category name (will be resolved to category_id)
 */
export function detectCategoryFromContext(task: string | null): string | null {
  if (!task) return null;

  const taskLower = task.toLowerCase();

  // Revenue/Deep Work categories
  if (
    taskLower.includes("coding") ||
    taskLower.includes("development") ||
    taskLower.includes("programming")
  ) {
    return "deep_work"; // Will map to "Deep Work" or "Work" category
  }

  if (
    taskLower.includes("design") ||
    taskLower.includes("writing") ||
    taskLower.includes("documentation")
  ) {
    return "revenue"; // Will map to revenue-generating category
  }

  // Admin categories
  if (
    taskLower.includes("admin") ||
    taskLower.includes("email") ||
    taskLower.includes("meeting") ||
    taskLower.includes("call")
  ) {
    return "admin";
  }

  // Personal/Break categories
  if (
    taskLower.includes("social media") ||
    taskLower.includes("watching videos") ||
    taskLower.includes("entertainment")
  ) {
    return "personal";
  }

  // Learning
  if (
    taskLower.includes("learning") ||
    taskLower.includes("study") ||
    taskLower.includes("reading")
  ) {
    return "learning";
  }

  return null;
}

/**
 * Combine task detection and category detection
 */
export function detectContext(
  activeTab: string,
  idleState: boolean
): DetectedContext {
  const taskDetection = detectLikelyTask(activeTab, idleState);
  
  if (!taskDetection.likelyTask) {
    return taskDetection;
  }

  const category = detectCategoryFromContext(taskDetection.likelyTask);
  
  return {
    ...taskDetection,
    categoryId: category,
  };
}

