/**
 * Admin utilities
 */

/**
 * List of admin email addresses
 * Can be overridden with ADMIN_EMAILS environment variable (comma-separated)
 */
const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",").map((email) => email.trim())
  : [
      "makeathera@gmail.com",
      "pavlepavloviccontent@gmail.com",
    ];

/**
 * Check if an email is an admin email
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Get list of admin emails (for display purposes only)
 */
export function getAdminEmails(): string[] {
  return [...ADMIN_EMAILS];
}

