#!/usr/bin/env node

/**
 * Development server startup script
 * Suppresses Node.js deprecation warnings from dependencies
 */

// Set NODE_OPTIONS before any modules load
process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || "") + " --no-deprecation";

// Suppress DEP0169 warning (url.parse() deprecation) at process level
if (typeof process.emitWarning === "function") {
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = function (warning, ...args) {
    // Suppress only the url.parse() deprecation warning (DEP0169)
    if (
      warning &&
      typeof warning === "object" &&
      warning.name === "DeprecationWarning" &&
      (warning.message?.includes("url.parse()") ||
        warning.message?.includes("DEP0169"))
    ) {
      return undefined; // Suppress this specific warning
    }
    // Call original for other warnings
    return originalEmitWarning.call(process, warning, ...args);
  };
}

// Also suppress via event listener
process.removeAllListeners("warning");
process.on("warning", (warning) => {
  // Suppress only the url.parse() deprecation warning (DEP0169)
  if (
    warning.name === "DeprecationWarning" &&
    (warning.message?.includes("url.parse()") ||
      warning.message?.includes("DEP0169"))
  ) {
    return; // Suppress this specific warning
  }
  // Log other warnings normally (but only in verbose mode)
  if (process.env.VERBOSE_WARNINGS) {
    console.warn(warning.name, warning.message);
  }
});

// Start Next.js dev server
// Get all arguments after the script name
const args = process.argv.slice(2);
const command = args.length > 0 ? args[0] : "dev";

// Modify process.argv to pass command to Next.js
process.argv = [process.argv[0], require.resolve("next/dist/bin/next"), command, ...args.slice(1)];

// Call Next.js bin
require("next/dist/bin/next");

