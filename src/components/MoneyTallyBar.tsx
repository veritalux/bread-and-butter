import { DollarSign, TrendingDown, PiggyBank } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function MoneyTallyBar() {
  const { finances } = useApp();
  const taxAmount = finances.weeklyIncome * (finances.taxRate / 100);
  const realIncome = finances.weeklyIncome - taxAmount - finances.weeklyInvestment;

  return (
    <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-center gap-6 text-xs sm:text-sm flex-wrap">
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-[var(--color-primary)]" />
          <span className="text-[var(--color-text-muted)]">Weekly Budget</span>
          <span className="font-semibold text-[var(--color-text-heading)] ml-1">
            ${finances.weeklyIncome.toLocaleString()}
          </span>
        </div>
        <div className="w-px h-4 bg-[var(--color-border)]" />
        <div className="flex items-center gap-1.5">
          <TrendingDown size={14} className="text-[var(--color-accent)]" />
          <span className="text-[var(--color-text-muted)]">After Tax & Invest</span>
          <span className="font-semibold text-[var(--color-primary)] ml-1">
            ${realIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="w-px h-4 bg-[var(--color-border)]" />
        <div className="flex items-center gap-1.5">
          <PiggyBank size={14} className="text-[var(--color-primary)]" />
          <span className="text-[var(--color-text-muted)]">Weekly Invest Goal</span>
          <span className="font-semibold text-[var(--color-text-heading)] ml-1">
            ${finances.weeklyInvestment}
          </span>
        </div>
      </div>
    </div>
  );
}
