import { useState } from "react";
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Flame,
  XCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { getActivityStatus, getDaysSinceActive } from "../types/user";
import type { AppUser, ActivityStatus } from "../types/user";

const statusConfig: Record<ActivityStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  active: { label: "Active", color: "#10B981", bg: "rgba(16, 185, 129, 0.1)", icon: CheckCircle },
  warning: { label: "Slipping", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", icon: Clock },
  inactive: { label: "Needs Outreach", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", icon: AlertTriangle },
};

function UserRow({ user }: { user: AppUser }) {
  const [expanded, setExpanded] = useState(false);
  const status = getActivityStatus(user.lastActiveDate);
  const daysSince = getDaysSinceActive(user.lastActiveDate);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const totalSaved = user.challenges.reduce((sum, c) => sum + c.saved, 0);
  const totalGoal = user.challenges.reduce((sum, c) => sum + c.goal, 0);
  const overallProgress = totalGoal > 0 ? Math.round((totalSaved / totalGoal) * 100) : 0;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden transition-all hover:border-[var(--color-border)]/80">
      {/* Main row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 text-left cursor-pointer bg-transparent border-0"
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: status === "active" ? "#10B981" : status === "warning" ? "#f59e0b" : "#ef4444" }}
        >
          {user.initials}
        </div>

        {/* Name & info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-text-heading)] text-sm truncate">{user.name}</span>
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ color: config.color, backgroundColor: config.bg }}
            >
              <StatusIcon size={10} />
              {config.label}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {daysSince === 0
              ? "Active today"
              : daysSince === 1
              ? "Last active yesterday"
              : `Last active ${daysSince} days ago`}
            {" · "}
            {user.challenges.length} challenge{user.challenges.length !== 1 && "s"}
          </p>
        </div>

        {/* Streak */}
        <div className="hidden sm:flex items-center gap-1.5 text-sm">
          <Flame size={14} className={user.streak > 0 ? "text-orange-400" : "text-[var(--color-text-muted)]"} />
          <span className={user.streak > 0 ? "font-semibold text-[var(--color-text-heading)]" : "text-[var(--color-text-muted)]"}>
            {user.streak}d
          </span>
        </div>

        {/* Progress */}
        <div className="hidden sm:block w-24">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--color-text-muted)]">{overallProgress}%</span>
          </div>
          <div className="h-1.5 bg-[var(--color-background)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${overallProgress}%`,
                backgroundColor: config.color,
              }}
            />
          </div>
        </div>

        {/* Expand toggle */}
        <div className="text-[var(--color-text-muted)]">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[var(--color-border)] animate-fade-in">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 mb-4">
            <div className="bg-[var(--color-background)] rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-[var(--color-primary)]">${totalSaved}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Total Saved</p>
            </div>
            <div className="bg-[var(--color-background)] rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-[var(--color-text-heading)]">{user.longestStreak}d</p>
              <p className="text-xs text-[var(--color-text-muted)]">Best Streak</p>
            </div>
            <div className="bg-[var(--color-background)] rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-[var(--color-text-heading)]">
                {new Date(user.joinedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">Joined</p>
            </div>
          </div>

          {/* Challenges */}
          <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Challenges</h4>
          <div className="space-y-2 mb-4">
            {user.challenges.map((c) => {
              const Icon = c.icon;
              const prog = Math.min((c.saved / c.goal) * 100, 100);
              return (
                <div key={c.id} className="flex items-center gap-3 bg-[var(--color-background)] rounded-lg p-3">
                  <Icon size={16} className="text-[var(--color-primary)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-heading)] truncate">{c.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${prog}%` }} />
                      </div>
                      <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                        ${c.saved}/${c.goal}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">{c.daysLeft}d left</span>
                </div>
              );
            })}
          </div>

          {/* Action button */}
          {status !== "active" && (
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed text-sm font-medium transition-colors cursor-pointer bg-transparent"
              style={{ borderColor: config.color, color: config.color }}
            >
              <MessageCircle size={16} />
              {status === "warning"
                ? `Nudge ${user.name.split(" ")[0]} — slipping for ${daysSince} days`
                : `Reach out to ${user.name.split(" ")[0]} — gone ${daysSince} days`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ModeratorDashboard() {
  const { allUsers, currentUser } = useApp();
  const [filter, setFilter] = useState<"all" | ActivityStatus>("all");

  const users = allUsers.filter((u) => u.role === "user");
  const filtered = filter === "all" ? users : users.filter((u) => getActivityStatus(u.lastActiveDate) === filter);

  const activeCount = users.filter((u) => getActivityStatus(u.lastActiveDate) === "active").length;
  const warningCount = users.filter((u) => getActivityStatus(u.lastActiveDate) === "warning").length;
  const inactiveCount = users.filter((u) => getActivityStatus(u.lastActiveDate) === "inactive").length;

  // Sort: inactive first, then warning, then active
  const sorted = [...filtered].sort((a, b) => {
    const order: Record<ActivityStatus, number> = { inactive: 0, warning: 1, active: 2 };
    return order[getActivityStatus(a.lastActiveDate)] - order[getActivityStatus(b.lastActiveDate)];
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-glow)] flex items-center justify-center">
            <Users size={20} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Moderator Dashboard</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {currentUser ? `Signed in as ${currentUser.name} — ` : ""}your people, their progress
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Members", value: users.length, icon: Users, color: "var(--color-primary)", filterVal: "all" as const },
          { label: "Active", value: activeCount, icon: CheckCircle, color: "#10B981", filterVal: "active" as const },
          { label: "Slipping", value: warningCount, icon: Clock, color: "#f59e0b", filterVal: "warning" as const },
          { label: "Needs Outreach", value: inactiveCount, icon: AlertTriangle, color: "#ef4444", filterVal: "inactive" as const },
        ].map((stat, i) => {
          const Icon = stat.icon;
          const isSelected = filter === stat.filterVal;
          return (
            <button
              key={i}
              onClick={() => setFilter(stat.filterVal)}
              className={`bg-[var(--color-surface)] border rounded-xl p-4 text-left transition-all cursor-pointer animate-fade-in ${
                isSelected ? "border-[var(--color-primary)]/50 ring-1 ring-[var(--color-primary)]/20" : "border-[var(--color-border)] hover:border-[var(--color-border)]/80"
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: stat.color }} />
                <span className="text-xs text-[var(--color-text-muted)]">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-heading)]">{stat.value}</p>
            </button>
          );
        })}
      </div>

      {/* Alert banner for inactive users */}
      {inactiveCount > 0 && filter === "all" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 animate-fade-in">
          <AlertTriangle size={20} className="text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">
              {inactiveCount} member{inactiveCount !== 1 && "s"} need{inactiveCount === 1 && "s"} personal outreach
            </p>
            <p className="text-xs text-red-400/70 mt-0.5">
              They haven't logged activity in 4+ days. Time for a check-in.
            </p>
          </div>
        </div>
      )}

      {/* User list */}
      <div className="space-y-3">
        {sorted.map((user) => (
          <UserRow key={user.id} user={user} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[var(--color-text-muted)]">
          <XCircle size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No members in this category</p>
        </div>
      )}
    </main>
  );
}
