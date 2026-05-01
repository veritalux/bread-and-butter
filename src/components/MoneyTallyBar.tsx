import { useState, useEffect } from "react";
import { DollarSign, TrendingDown, PiggyBank, Wallet, TrendingUp } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useApp } from "../context/useApp";
import type { DailyLogEntry } from "../types/dailyLog";

function toDateStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MoneyTallyBar() {
  const { onboardingData, finances, setFinances, currentUser } = useApp();
  const [editingInvest, setEditingInvest] = useState(false);
  const [investInput, setInvestInput] = useState(String(finances.weeklyInvestment));
  const [weeklyNetSavings, setWeeklyNetSavings] = useState<number | null>(null);

  // Keep investInput in sync with finances when not editing
  useEffect(() => {
    if (!editingInvest) {
      setInvestInput(String(finances.weeklyInvestment));
    }
  }, [finances.weeklyInvestment, editingInvest]);

  // Fetch past 7 days of daily logs and compute net savings (income − spending)
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    async function fetchWeeklySavings() {
      const now = new Date();
      const startDate = toDateStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
      const today = toDateStr(now);
      const snap = await getDocs(collection(db, "users", currentUser!.id, "dailyLogs"));
      if (cancelled) return;
      const logs = snap.docs
        .map((d) => d.data() as DailyLogEntry)
        .filter((l) => l.date >= startDate && l.date <= today);
      const netIncome = logs.reduce((s, l) => s + l.income.reduce((a, e) => a + e.amount, 0), 0);
      const netSpending = logs.reduce((s, l) => s + l.spending.reduce((a, e) => a + e.amount, 0), 0);
      setWeeklyNetSavings(netIncome - netSpending);
    }
    fetchWeeklySavings();
    return () => { cancelled = true; };
  }, [currentUser]);

  const handleInvestSave = async () => {
    const val = Math.max(0, Number(investInput) || 0);
    await setFinances({ ...finances, weeklyInvestment: val });
    setEditingInvest(false);
  };

  // Use onboarding monthly income if available, fall back to finances weekly
  const monthlyIncome = onboardingData?.monthlyIncome ?? finances.weeklyIncome * 4;
  const weeklyIncome = monthlyIncome / 4;
  const monthlyFixed = onboardingData?.monthlyFixedPayments ?? 0;
  const weeklyFixed = monthlyFixed / 4;
  const taxAmount = weeklyIncome * (finances.taxRate / 100);
  const realIncome = weeklyIncome - taxAmount - finances.weeklyInvestment - weeklyFixed;

  return (
    <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="max-w-5xl mx-auto px-4 py-5">
        {/* Headline: big usable income */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm sm:text-base uppercase tracking-wider">
            <Wallet size={18} className="text-[var(--color-primary)]" />
            Usable Income This Week
          </div>
          <span
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[var(--color-primary)] leading-none tracking-tight"
            style={{ textShadow: "0 2px 18px rgba(0,0,0,0.25)" }}
          >
            ${Math.max(0, realIncome).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Supporting breakdown */}
        <div className="mt-3 flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm flex-wrap text-[var(--color-text-muted)]">
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-[var(--color-primary)]" />
            <span>Income</span>
            <span className="font-semibold text-[var(--color-text-heading)] ml-1">
              ${weeklyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="w-px h-4 bg-[var(--color-border)]" />
          <div className="flex items-center gap-1.5">
            <TrendingDown size={14} className="text-[var(--color-accent)]" />
            <span>Tax {finances.taxRate}%</span>
            <span className="font-semibold text-[var(--color-text-heading)] ml-1">
              −${taxAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          {weeklyFixed > 0 && (
            <>
              <div className="w-px h-4 bg-[var(--color-border)]" />
              <div className="flex items-center gap-1.5">
                <TrendingDown size={14} className="text-red-400" />
                <span>Fixed</span>
                <span className="font-semibold text-[var(--color-text-heading)] ml-1">
                  −${weeklyFixed.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </>
          )}
          <div className="w-px h-4 bg-[var(--color-border)]" />
          {/* Invest — click to edit */}
          <div className="flex items-center gap-1.5">
            <PiggyBank size={14} className="text-[var(--color-primary)]" />
            <span>Invest</span>
            {editingInvest ? (
              <span className="flex items-center gap-0.5 ml-1">
                <span className="text-[var(--color-text-muted)]">−$</span>
                <input
                  type="number"
                  value={investInput}
                  onChange={(e) => setInvestInput(e.target.value)}
                  onBlur={handleInvestSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleInvestSave();
                    if (e.key === "Escape") setEditingInvest(false);
                  }}
                  className="w-20 px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-background)] text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                  autoFocus
                  min="0"
                />
              </span>
            ) : (
              <button
                onClick={() => setEditingInvest(true)}
                title="Click to edit"
                className="font-semibold text-[var(--color-text-heading)] ml-1 cursor-pointer bg-transparent border-0 hover:text-[var(--color-primary)] hover:underline underline-offset-2 transition-colors"
              >
                −${finances.weeklyInvestment}
              </button>
            )}
          </div>
          {/* Actual net savings from daily logs (past 7 days) */}
          {weeklyNetSavings !== null && (
            <>
              <div className="w-px h-4 bg-[var(--color-border)]" />
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className={weeklyNetSavings >= 0 ? "text-[var(--color-primary)]" : "text-red-400"} />
                <span>Saved</span>
                <span className={`font-semibold ml-1 ${weeklyNetSavings >= 0 ? "text-[var(--color-text-heading)]" : "text-red-400"}`}>
                  {weeklyNetSavings >= 0 ? "+" : ""}${Math.abs(weeklyNetSavings).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
