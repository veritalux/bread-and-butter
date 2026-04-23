import { useState, useEffect } from "react";
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
  Settings,
  Send,
  FileText,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useApp } from "../context/useApp";
import { ChallengeIcon } from "../data/sampleData";
import { getActivityStatus, getDaysSinceActive } from "../types/user";
import { computeDaysLeft } from "../types/challenge";
import type { Challenge } from "../types/challenge";
import type { AppUser, ActivityStatus, CheckInThreshold } from "../types/user";

const statusConfig: Record<ActivityStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  active: { label: "Active", color: "#10B981", bg: "rgba(16, 185, 129, 0.1)", icon: CheckCircle },
  warning: { label: "Slipping", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", icon: Clock },
  inactive: { label: "Needs Outreach", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", icon: AlertTriangle },
};

function ThresholdEditor({ threshold, onChange, onClose }: {
  threshold: CheckInThreshold;
  onChange: (t: CheckInThreshold) => void;
  onClose: () => void;
}) {
  const [warn, setWarn] = useState(threshold.warningDays);
  const [inactive, setInactive] = useState(threshold.inactiveDays);

  return (
    <div className="bg-[var(--color-background)] rounded-lg p-4 mt-3 border border-[var(--color-border)] animate-fade-in">
      <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
        Check-in Thresholds
      </h4>
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label className="text-xs text-[var(--color-text-muted)] block mb-1">
            Flag as slipping after
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={30}
              value={warn}
              onChange={(e) => setWarn(Math.max(1, Number(e.target.value)))}
              className="w-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-sm text-[var(--color-text)] text-center"
            />
            <span className="text-xs text-[var(--color-text-muted)]">days</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-[var(--color-text-muted)] block mb-1">
            Flag as needs outreach after
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={2}
              max={60}
              value={inactive}
              onChange={(e) => setInactive(Math.max(2, Number(e.target.value)))}
              className="w-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-sm text-[var(--color-text)] text-center"
            />
            <span className="text-xs text-[var(--color-text-muted)]">days</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            const correctedInactive = Math.max(inactive, warn + 1);
            onChange({ warningDays: warn, inactiveDays: correctedInactive });
            onClose();
          }}
          className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs font-medium cursor-pointer border-0"
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-medium cursor-pointer bg-transparent"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function UserRow({ user }: { user: AppUser }) {
  const { getThreshold, setThreshold, getCheckInLogs, addCheckInLog } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [showThresholdEditor, setShowThresholdEditor] = useState(false);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [checkInNote, setCheckInNote] = useState("");
  const [showLogs, setShowLogs] = useState(false);
  const [userChallenges, setUserChallenges] = useState<Challenge[]>([]);

  const threshold = getThreshold(user.id);
  const status = getActivityStatus(user.lastActiveDate, threshold);
  const daysSince = getDaysSinceActive(user.lastActiveDate);
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const logs = getCheckInLogs(user.id);

  useEffect(() => {
    if (!expanded) return;
    getDocs(collection(db, "users", user.id, "challenges")).then((snap) => {
      setUserChallenges(snap.docs.map((d) => {
        const data = d.data() as Omit<Challenge, "id" | "daysLeft">;
        return {
          ...data,
          id: d.id,
          daysLeft: data.startDate ? computeDaysLeft(data.startDate, data.totalDays) : 0,
        } as Challenge;
      }));
    });
  }, [expanded, user.id]);

  const totalSaved = userChallenges.reduce((sum, c) => sum + c.saved, 0);
  const totalGoal = userChallenges.reduce((sum, c) => sum + c.goal, 0);
  const overallProgress = totalGoal > 0 ? Math.round((totalSaved / totalGoal) * 100) : 0;

  const handleCheckIn = () => {
    if (!checkInNote.trim()) return;
    addCheckInLog(user.id, checkInNote.trim());
    setCheckInNote("");
    setShowCheckInForm(false);
    setShowLogs(true);
  };

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
            {userChallenges.length} challenge{userChallenges.length !== 1 && "s"}
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

          {/* Threshold info line */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[var(--color-text-muted)]">
              Slipping after {threshold.warningDays}d · Outreach after {threshold.inactiveDays}d
            </p>
            <button
              onClick={() => setShowThresholdEditor(!showThresholdEditor)}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] cursor-pointer bg-transparent border-0 hover:underline"
            >
              <Settings size={12} />
              Adjust
            </button>
          </div>

          {showThresholdEditor && (
            <ThresholdEditor
              threshold={threshold}
              onChange={(t) => setThreshold(user.id, t)}
              onClose={() => setShowThresholdEditor(false)}
            />
          )}

          {/* Challenges */}
          <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Challenges</h4>
          <div className="space-y-2 mb-4">
            {userChallenges.map((c) => {
              const prog = Math.min((c.saved / c.goal) * 100, 100);
              return (
                <div key={c.id} className="flex items-center gap-3 bg-[var(--color-background)] rounded-lg p-3">
                  <ChallengeIcon name={c.icon} size={16} className="text-[var(--color-primary)] shrink-0" />
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

          {/* Check-in section */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => { setShowCheckInForm(!showCheckInForm); setShowLogs(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium cursor-pointer border-0 hover:brightness-110 transition-all"
            >
              <MessageCircle size={16} />
              Log Check-in
            </button>
            {logs.length > 0 && (
              <button
                onClick={() => { setShowLogs(!showLogs); setShowCheckInForm(false); }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm font-medium cursor-pointer bg-transparent hover:bg-[var(--color-surface)] transition-colors"
              >
                <FileText size={14} />
                {logs.length}
              </button>
            )}
          </div>

          {/* Check-in form */}
          {showCheckInForm && (
            <div className="bg-[var(--color-background)] rounded-lg p-4 border border-[var(--color-border)] mb-3 animate-fade-in">
              <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                New Check-in with {user.name.split(" ")[0]}
              </h4>
              <textarea
                value={checkInNote}
                onChange={(e) => setCheckInNote(e.target.value)}
                placeholder="What did you discuss? How are they doing?"
                rows={3}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] resize-none mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCheckIn}
                  disabled={!checkInNote.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs font-medium cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={12} />
                  Save Check-in
                </button>
                <button
                  onClick={() => { setShowCheckInForm(false); setCheckInNote(""); }}
                  className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-medium cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Check-in log history */}
          {showLogs && logs.length > 0 && (
            <div className="bg-[var(--color-background)] rounded-lg p-4 border border-[var(--color-border)] animate-fade-in">
              <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                Check-in History
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {[...logs].reverse().map((log) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="w-1.5 rounded-full bg-[var(--color-primary)] shrink-0 mt-1" style={{ minHeight: "16px" }} />
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {new Date(log.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-sm text-[var(--color-text)] mt-0.5">{log.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ModeratorDashboard() {
  const { allUsers, currentUser, getThreshold } = useApp();
  const [filter, setFilter] = useState<"all" | ActivityStatus>("all");

  const users = allUsers.filter((u) => u.role === "user");
  const filtered = filter === "all"
    ? users
    : users.filter((u) => getActivityStatus(u.lastActiveDate, getThreshold(u.id)) === filter);

  const activeCount = users.filter((u) => getActivityStatus(u.lastActiveDate, getThreshold(u.id)) === "active").length;
  const warningCount = users.filter((u) => getActivityStatus(u.lastActiveDate, getThreshold(u.id)) === "warning").length;
  const inactiveCount = users.filter((u) => getActivityStatus(u.lastActiveDate, getThreshold(u.id)) === "inactive").length;

  // Sort: inactive first, then warning, then active
  const sorted = [...filtered].sort((a, b) => {
    const order: Record<ActivityStatus, number> = { inactive: 0, warning: 1, active: 2 };
    return (
      order[getActivityStatus(a.lastActiveDate, getThreshold(a.id))] -
      order[getActivityStatus(b.lastActiveDate, getThreshold(b.id))]
    );
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
        {currentUser?.coachCode && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
            <span className="text-xs text-[var(--color-text-muted)]">Your coach code:</span>
            <span className="text-sm font-bold text-[var(--color-primary)] tracking-wider">{currentUser.coachCode}</span>
            <span className="text-xs text-[var(--color-text-muted)]">— share this with your users to sign up</span>
          </div>
        )}
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
              Check each member's thresholds — they've passed their outreach window.
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
