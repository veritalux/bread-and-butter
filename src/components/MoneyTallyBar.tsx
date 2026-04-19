import { DollarSign, TrendingDown, PiggyBank, Wallet } from "lucide-react";
import { useApp } from "../context/useApp";

export default function MoneyTallyBar() {
  const { finances } = useApp();
  const taxAmount = finances.weeklyIncome * (finances.taxRate / 100);
  const realIncome = finances.weeklyIncome - taxAmount - finances.weeklyInvestment;

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
            ${realIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Supporting breakdown */}
        <div className="mt-3 flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm flex-wrap text-[var(--color-text-muted)]">
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-[var(--color-primary)]" />
            <span>Budget</span>
            <span className="font-semibold text-[var(--color-text-heading)] ml-1">
              ${finances.weeklyIncome.toLocaleString()}
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
          <div className="w-px h-4 bg-[var(--color-border)]" />
          <div className="flex items-center gap-1.5">
            <PiggyBank size={14} className="text-[var(--color-primary)]" />
            <span>Invest</span>
            <span className="font-semibold text-[var(--color-text-heading)] ml-1">
              −${finances.weeklyInvestment}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
