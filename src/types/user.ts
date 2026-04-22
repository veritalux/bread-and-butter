export type UserRole = "user" | "moderator";

export type ActivityStatus = "active" | "warning" | "inactive";

export interface AppUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  joinedDate: string;
  lastActiveDate: string;
  streak: number;
  longestStreak: number;
  moderatorId?: string;
}

export interface CheckInThreshold {
  warningDays: number;
  inactiveDays: number;
}

export interface CheckInLog {
  id: string;
  date: string;
  note: string;
}

export const DEFAULT_THRESHOLD: CheckInThreshold = { warningDays: 2, inactiveDays: 4 };

export function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getActivityStatus(lastActiveDate: string, threshold?: CheckInThreshold): ActivityStatus {
  const daysSince = getDaysSinceActive(lastActiveDate);
  const t = threshold ?? DEFAULT_THRESHOLD;

  if (daysSince < t.warningDays) return "active";
  if (daysSince < t.inactiveDays) return "warning";
  return "inactive";
}

export function getDaysSinceActive(lastActiveDate: string): number {
  const now = new Date();
  const last = new Date(lastActiveDate);
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}
