import { useState } from "react";
import { X, CheckCircle, Calendar, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Challenge } from "../types/challenge";
import { getIcon } from "../data/sampleData";

interface Props {
  challenge: Challenge;
  onClose: () => void;
}

export default function ChallengeTracker({ challenge, onClose }: Props) {
  const { logProgress } = useApp();
  const [amount, setAmount] = useState("5");
  const [note, setNote] = useState("");
  const progress = Math.min((challenge.saved / challenge.goal) * 100, 100);
  const Icon = getIcon(challenge.icon);

  const handleLog = () => {
    const numAmount = Number(amount) || 5;
    logProgress(challenge.id, numAmount, note || undefined);
    setNote("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-slide-up"
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-glow)] flex items-center justify-center">
                <Icon size={20} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <h2 className="font-bold text-[var(--color-text-heading)]">{challenge.title}</h2>
                <p className="text-xs text-[var(--color-text-muted)]">{challenge.description}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors cursor-pointer bg-transparent border-0 text-[var(--color-text-muted)]">
              <X size={18} />
            </button>
          </div>

          {/* Big progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-[var(--color-primary)]">${challenge.saved}</span>
              <span className="text-[var(--color-text-muted)]">${challenge.goal} goal</span>
            </div>
            <div className="h-4 bg-[var(--color-background)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1.5">
              <span>{Math.round(progress)}% complete</span>
              <span>{challenge.daysLeft} days remaining</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="px-5 pt-4 pb-2 grid grid-cols-2 gap-3">
          <div className="bg-[var(--color-background)] rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-[var(--color-text-heading)]">{challenge.logs.length}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Days Logged</p>
          </div>
          <div className="bg-[var(--color-background)] rounded-lg p-3 text-center">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Investing to</p>
            <div className="flex items-center justify-center gap-1 text-sm font-medium text-[var(--color-primary)]">
              <ArrowRight size={12} />
              {challenge.investTo}
            </div>
          </div>
        </div>

        {/* Log progress form */}
        <div className="p-5 border-t border-[var(--color-border)] mt-2">
          <h3 className="text-sm font-semibold text-[var(--color-text-heading)] mb-3">Log Today's Progress</h3>
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="$ saved"
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
              />
            </div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="flex-[2] px-3 py-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
            />
          </div>
          <button
            onClick={handleLog}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold hover:brightness-110 transition-all cursor-pointer border-0"
          >
            <CheckCircle size={16} />
            I Stayed on Track Today
          </button>
        </div>

        {/* Log history */}
        {challenge.logs.length > 0 && (
          <div className="px-5 pb-5 max-h-40 overflow-y-auto">
            <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">History</h4>
            <div className="space-y-1.5">
              {[...challenge.logs].reverse().map((log, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg bg-[var(--color-background)]">
                  <Calendar size={12} className="text-[var(--color-text-muted)] shrink-0" />
                  <span className="text-[var(--color-text-muted)]">
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                  <span className="text-[var(--color-primary)] font-medium ml-auto">+${log.amount}</span>
                  {log.note && <span className="text-[var(--color-text-muted)]">· {log.note}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
