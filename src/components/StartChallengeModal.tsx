import { useState } from "react";
import { X, ArrowLeft, Rocket } from "lucide-react";
import { useApp } from "../context/useApp";
import { challengeTemplates, ChallengeIcon } from "../data/sampleData";
import type { ChallengeTemplate } from "../types/challenge";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  recommended: { label: "Recommended", color: "var(--color-primary)" },
  trending: { label: "Trending Now", color: "#a855f7" },
  purchase: { label: "Save for a Purchase", color: "#3b82f6" },
};

export default function StartChallengeModal({ isOpen, onClose }: Props) {
  const { addChallenge } = useApp();
  const [selected, setSelected] = useState<ChallengeTemplate | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [goal, setGoal] = useState("");
  const [days, setDays] = useState("");
  const [investTo, setInvestTo] = useState("Index Fund");

  const handleClose = () => {
    setSelected(null);
    setAnswers({});
    setGoal("");
    setDays("");
    onClose();
  };

  const handleBack = () => {
    setSelected(null);
    setAnswers({});
  };

  const handleStart = () => {
    if (!selected) return;
    const numGoal = Number(goal) || selected.defaultGoal;
    const numDays = Number(days) || selected.defaultDays;

    addChallenge({
      id: Date.now().toString(),
      title: selected.title,
      description: selected.description,
      icon: selected.icon,
      saved: 0,
      goal: numGoal,
      startDate: new Date().toISOString().slice(0, 10),
      totalDays: numDays,
      investTo,
      category: selected.category,
      logs: [],
    });

    handleClose();
  };

  const grouped = {
    recommended: challengeTemplates.filter((c) => c.category === "recommended"),
    trending: challengeTemplates.filter((c) => c.category === "trending"),
    purchase: challengeTemplates.filter((c) => c.category === "purchase"),
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            {selected && (
              <button onClick={handleBack} className="p-1 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors cursor-pointer bg-transparent border-0 text-[var(--color-text)]">
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="font-bold text-lg text-[var(--color-text-heading)]">
              {selected ? selected.title : "Start a Challenge"}
            </h2>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors cursor-pointer bg-transparent border-0 text-[var(--color-text-muted)]">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 flex-1">
          {!selected ? (
            <div className="space-y-5">
              {(["recommended", "trending", "purchase"] as const).map((cat) => (
                <div key={cat}>
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: categoryLabels[cat].color }}
                  >
                    {cat === "trending" && "🔥 "}{categoryLabels[cat].label}
                  </h3>
                  <div className="space-y-2">
                    {grouped[cat].map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelected(c);
                            setGoal(c.defaultGoal.toString());
                            setDays(c.defaultDays.toString());
                          }}
                          className="w-full group flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 transition-all text-left cursor-pointer bg-transparent"
                        >
                          <div className="w-9 h-9 rounded-lg bg-[var(--color-glow)] flex items-center justify-center shrink-0">
                            <ChallengeIcon name={c.icon} size={18} className="text-[var(--color-primary)]" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-[var(--color-text-heading)]">{c.title}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{c.description}</p>
                          </div>
                        </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-[var(--color-text-muted)]">{selected.description}</p>

              <div className="space-y-4">
                {selected.guidelines.map((q, i) => (
                  <div key={i}>
                    <label className="block text-xs font-medium text-[var(--color-text-heading)] mb-1.5">{q}</label>
                    <input
                      value={answers[i] || ""}
                      onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
                      placeholder="Enter your answer"
                    />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-heading)] mb-1.5">Goal ($)</label>
                    <input
                      type="number"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-heading)] mb-1.5">Duration (days)</label>
                    <input
                      type="number"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-heading)] mb-1.5">Invest savings to</label>
                  <select
                    value={investTo}
                    onChange={(e) => setInvestTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
                  >
                    <option>Index Fund</option>
                    <option>Savings Account</option>
                    <option>Emergency Fund</option>
                    <option>Crypto</option>
                    <option>Individual Stock</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold hover:brightness-110 transition-all cursor-pointer border-0"
              >
                <Rocket size={18} />
                Start Challenge
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
