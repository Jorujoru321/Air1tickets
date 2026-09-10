import "server-only";
import type { SafeUser } from "@/lib/auth/current-user";

/**
 * Who may see the leads dashboard: users with the "admin" role, plus any
 * account whose email is listed in ADMIN_EMAILS (comma separated). The env
 * list lets the business grant access without touching the database.
 */
export function isAdminUser(user: SafeUser | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(user.email.toLowerCase());
}
