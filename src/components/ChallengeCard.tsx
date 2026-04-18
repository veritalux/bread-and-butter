import { ArrowRight } from "lucide-react";
import type { Challenge } from "../types/challenge";
import { getIcon } from "../data/sampleData";

interface Props {
  challenge: Challenge;
  onLogProgress?: () => void;
  onClick?: () => void;
}

export default function ChallengeCard({ challenge, onLogProgress, onClick }: Props) {
  const progress = Math.min((challenge.saved / challenge.goal) * 100, 100);
  const Icon = getIcon(challenge.icon);

  return (
    <div
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-primary)]/30 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-glow)] flex items-center justify-center">
            <Icon size={20} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-heading)] text-sm">{challenge.title}</h3>
            <p className="text-xs text-[var(--color-text-muted)]">{challenge.description}</p>
          </div>
        </div>
        <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-2 py-1 rounded-md whitespace-nowrap">
          {challenge.daysLeft}d left
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[var(--color-primary)] font-medium">${challenge.saved} saved</span>
          <span className="text-[var(--color-text-muted)]">${challenge.goal} goal</span>
        </div>
        <div className="h-2 bg-[var(--color-background)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] rounded-full animate-progress transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          <ArrowRight size={12} />
          Redirecting to {challenge.investTo}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLogProgress?.();
          }}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors cursor-pointer border-0"
        >
          Log Progress
        </button>
      </div>
    </div>
  );
}
