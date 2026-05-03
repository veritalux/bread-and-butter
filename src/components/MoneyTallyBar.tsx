import { useState, useRef } from "react";
import { DollarSign, TrendingDown, PiggyBank, Wallet, Pencil, Check } from "lucide-react";
import { useApp } from "../context/useApp";

export default function MoneyTallyBar() {
  const { onboardingData, finances, setFinances } = useApp();
  const [editingInvest, setEditingInvest] = useState(false);
  const [investInput, setInvestInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Use onboarding monthly income if available, fall back to finances weekly
  const monthlyIncome = onboardingData?.monthlyIncome ?? finances.weeklyIncome * 4;
  const weeklyIncome = monthlyIncome / 4;
  const monthlyFixed = onboardingData?.monthlyFixedPayments ?? 0;
  const weeklyFixed = monthlyFixed / 4;
  const taxAmount = weeklyIncome * (finances.taxRate / 100);
  const realIncome = weeklyIncome - taxAmount - finances.weeklyInvestment - weeklyFixed;

  const startEditInvest = () => {
    setInvestInput(String(finances.weeklyInvestment));
    setEditingInvest(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitInvest = () => {
    const val = Math.max(0, Number(investInput) || 0);
    setFinances({ ...finances, weeklyInvestment: val });
    setEditingInvest(false);
  };

  const handleInvestKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitInvest();
    if (e.key === "Escape") setEditingInvest(false);
  };

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
          <div className="flex items-center gap-1.5">
            <PiggyBank size={14} className="text-[var(--color-primary)]" />
            <span>Invest</span>
            {editingInvest ? (
              <span className="flex items-center gap-1 ml-1">
                <span className="text-xs text-[var(--color-text-muted)]">−$</span>
                <input
                  ref={inputRef}
                  type="number"
                  value={investInput}
                  onChange={(e) => setInvestInput(e.target.value)}
                  onBlur={commitInvest}
                  onKeyDown={handleInvestKeyDown}
                  className="w-16 px-1 py-0.5 rounded bg-[var(--color-background)] border border-[var(--color-primary)] text-xs text-[var(--color-text)] focus:outline-none"
                  min="0"
                  autoFocus
                />
                <button onClick={commitInvest} className="text-[var(--color-primary)] cursor-pointer bg-transparent border-0 p-0">
                  <Check size={12} />
                </button>
              </span>
            ) : (
              <span className="flex items-center gap-1 ml-1">
                <span className="font-semibold text-[var(--color-text-heading)]">
                  −${finances.weeklyInvestment}
                </span>
                <button onClick={startEditInvest} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] cursor-pointer bg-transparent border-0 p-0 transition-colors">
                  <Pencil size={11} />
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
