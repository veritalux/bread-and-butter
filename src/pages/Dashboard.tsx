import { Link } from "react-router-dom";
import { CalendarPlus, Flame, Target } from "lucide-react";
import StatsBar from "../components/StatsBar";
import AccountabilityBanner from "../components/AccountabilityBanner";
import ChallengesSection from "../components/ChallengesSection";
import MotivationBanner from "../components/MotivationBanner";
import FinancialGraph from "../components/FinancialGraph";
import { useApp } from "../context/useApp";

export default function Dashboard() {
  const { currentUser, allUsers, challenges } = useApp();
  const streak = currentUser?.streak ?? 0;
  const longestStreak = currentUser?.longestStreak ?? 0;
  const activeChallenges = challenges.filter((c) => c.saved < c.goal).length;

  const moderator =
    currentUser?.moderatorId
      ? allUsers.find((u) => u.id === currentUser.moderatorId)
      : allUsers.find((u) => u.role === "moderator");

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Quick action cards */}
      <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in">
        <Link
          to="/daily-log"
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-3 hover:border-[var(--color-primary)]/30 transition-all no-underline"
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--color-glow)] flex items-center justify-center">
            <CalendarPlus size={20} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-heading)]">Log Today</p>
            <p className="text-xs text-[var(--color-text-muted)]">Income & spending</p>
          </div>
        </Link>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <Flame size={20} className={streak > 0 ? "text-orange-400" : "text-[var(--color-text-muted)]"} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-heading)]">{streak}d Streak</p>
            <p className="text-xs text-[var(--color-text-muted)]">Best: {longestStreak}d</p>
          </div>
        </div>

        <Link
          to="/challenges"
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-3 hover:border-[var(--color-primary)]/30 transition-all no-underline"
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--color-glow)] flex items-center justify-center">
            <Target size={20} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-heading)]">{activeChallenges} Active</p>
            <p className="text-xs text-[var(--color-text-muted)]">Challenges</p>
          </div>
        </Link>
      </div>

      {/* Financial Graph */}
      <FinancialGraph />

      {/* Stats */}
      <StatsBar />

      {/* Accountability */}
      <AccountabilityBanner
        streak={streak}
        longestStreak={longestStreak}
        moderatorName={moderator?.name ?? "your coach"}
      />

      {/* Active Challenges */}
      <ChallengesSection />

      {/* Motivation */}
      <MotivationBanner />
    </main>
  );
}
