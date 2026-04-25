import { useState } from "react";
import { Save, Check, User, Info } from "lucide-react";
import { useApp } from "../context/useApp";
import { GOAL_OPTIONS } from "../types/onboarding";
import type { OnboardingData } from "../types/onboarding";
import { estimateTaxRate } from "../lib/taxEstimator";

export default function Profile() {
  const { currentUser, onboardingData, completeOnboarding, finances, setFinances } = useApp();

  const [cashOnHand, setCashOnHand] = useState(() => String(onboardingData?.cashOnHand ?? 0));
  const [monthlyFixedPayments, setMonthlyFixedPayments] = useState(() => String(onboardingData?.monthlyFixedPayments ?? 0));
  const [debtAmount, setDebtAmount] = useState(() => String(onboardingData?.debtAmount ?? 0));
  const [monthlyIncome, setMonthlyIncome] = useState(() => String(onboardingData?.monthlyIncome ?? finances.weeklyIncome * 4));
  const [isDependent, setIsDependent] = useState(() => onboardingData?.isDependent ?? false);
  const [weeklyInvestment, setWeeklyInvestment] = useState(() => String(onboardingData?.weeklyInvestment ?? finances.weeklyInvestment));
  const estimatedTax = estimateTaxRate(Number(monthlyIncome) || 0, isDependent);
  const [goals, setGoals] = useState<string[]>(() => onboardingData?.goals ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < 3 ? [...prev, id] : prev
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const data: OnboardingData = {
      cashOnHand: Number(cashOnHand) || 0,
      monthlyFixedPayments: Number(monthlyFixedPayments) || 0,
      debtAmount: Number(debtAmount) || 0,
      monthlyIncome: Number(monthlyIncome) || 0,
      isDependent,
      taxRate: estimatedTax,
      weeklyInvestment: Number(weeklyInvestment) || 0,
      goals,
    };
    await completeOnboarding(data);
    // Also update finances directly
    setFinances({
      weeklyIncome: Math.round(data.monthlyIncome / 4),
      taxRate: data.taxRate,
      weeklyInvestment: data.weeklyInvestment,
    });
    setSaving(false);
    setSaved(true);
  };

  const inputClass = "w-full pl-7 pr-3 py-2.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors";


  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary-foreground)] text-xl font-bold">
          {currentUser?.initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">{currentUser?.name}</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{currentUser?.email}</p>
        </div>
      </div>

      {/* Financial Profile */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} className="text-[var(--color-primary)]" />
          <h2 className="text-base font-semibold text-[var(--color-text-heading)]">Financial Profile</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-heading)] mb-1.5">Cash on hand</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-sm">$</span>
              <input type="number" value={cashOnHand} onChange={(e) => { setCashOnHand(e.target.value); setSaved(false); }} className={inputClass} min="0" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-heading)] mb-1.5">Monthly income (pre-tax)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-sm">$</span>
              <input type="number" value={monthlyIncome} onChange={(e) => { setMonthlyIncome(e.target.value); setSaved(false); }} className={inputClass} min="0" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-heading)] mb-1.5">Monthly fixed payments</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-sm">$</span>
              <input type="number" value={monthlyFixedPayments} onChange={(e) => { setMonthlyFixedPayments(e.target.value); setSaved(false); }} className={inputClass} min="0" />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Rent, subscriptions, car payments, insurance</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-heading)] mb-1.5">Total debt</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-sm">$</span>
              <input type="number" value={debtAmount} onChange={(e) => { setDebtAmount(e.target.value); setSaved(false); }} className={inputClass} min="0" />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[var(--color-text-heading)] mb-1.5">Tax situation</label>
            <button
              type="button"
              onClick={() => { setIsDependent((prev) => !prev); setSaved(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium text-left transition-all cursor-pointer ${
                isDependent
                  ? "border-[var(--color-primary)] bg-[var(--color-glow)] text-[var(--color-text-heading)]"
                  : "border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)]"
              }`}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                isDependent ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-border)]"
              }`}>
                {isDependent && <Check size={10} className="text-[var(--color-primary-foreground)]" />}
              </div>
              I am claimed as a dependent on someone else's tax return
            </button>
            <div className="flex items-center gap-1.5 mt-2">
              <Info size={12} className="text-[var(--color-text-muted)] shrink-0" />
              <p className="text-xs text-[var(--color-text-muted)]">
                Estimated tax rate: <span className="font-semibold text-[var(--color-text)]">{estimatedTax}%</span> — auto-calculated for Salem, OR based on your income{isDependent ? " as a dependent" : ""}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-heading)] mb-1.5">Weekly investment / savings</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-sm">$</span>
              <input type="number" value={weeklyInvestment} onChange={(e) => { setWeeklyInvestment(e.target.value); setSaved(false); }} className={inputClass} min="0" />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">401k, savings transfers, brokerage deposits</p>
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-[var(--color-text-heading)] mb-1">Your Goals</h2>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">Pick up to 3. Your coach can see these.</p>
        <div className="space-y-2">
          {GOAL_OPTIONS.map((g) => {
            const selected = goals.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGoal(g.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium text-left transition-all cursor-pointer ${
                  selected
                    ? "border-[var(--color-primary)] bg-[var(--color-glow)] text-[var(--color-text-heading)]"
                    : "border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border)]/80"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selected ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-border)]"
                }`}>
                  {selected && <Check size={12} className="text-[var(--color-primary-foreground)]" />}
                </div>
                {g.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold hover:brightness-110 transition-all cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Save size={18} />
        {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
      </button>
    </main>
  );
}
