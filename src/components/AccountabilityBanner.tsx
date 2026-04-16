import { Eye, Flame } from "lucide-react";

interface Props {
  streak: number;
  longestStreak: number;
  moderatorName?: string;
}

export default function AccountabilityBanner({ streak, longestStreak, moderatorName = "your coach" }: Props) {
  return (
    <div className="max-w-5xl mx-auto px-4 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Streak card */}
        <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <Flame size={24} className={streak > 0 ? "text-orange-400" : "text-[var(--color-text-muted)]"} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--color-text-heading)]">{streak}</span>
              <span className="text-sm text-[var(--color-text-muted)]">day streak</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              {streak > 0
                ? streak >= longestStreak
                  ? "You're on your longest streak ever!"
                  : `Best: ${longestStreak} days — keep going!`
                : `Your best was ${longestStreak} days. Start a new streak today!`}
            </p>
          </div>
        </div>

        {/* Accountability reminder */}
        <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-primary)]/20 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-glow)] flex items-center justify-center">
            <Eye size={22} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text-heading)]">
              Someone's got your back
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {moderatorName} checks in when you go quiet. Stay on track — they're rooting for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
