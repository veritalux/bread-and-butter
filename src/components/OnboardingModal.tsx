import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, Target } from "lucide-react";
import type { OnboardingData } from "../types/onboarding";
import { GOAL_OPTIONS } from "../types/onboarding";
import { estimateTaxRate } from "../lib/taxEstimator";

interface Props {
  onComplete: (data: OnboardingData) => void;
}

export default function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [cashOnHand, setCashOnHand] = useState("");
  const [monthlyFixedPayments, setMonthlyFixedPayments] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [isDependent, setIsDependent] = useState<boolean | null>(null);
  const [weeklyInvestment, setWeeklyInvestment] = useState("");
  const [goals, setGoals] = useState<string[]>([]);

  const totalSteps = 7;

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleSubmit = () => {
    const income = Number(monthlyIncome) || 0;
    const dependent = isDependent ?? false;
    onComplete({
      cashOnHand: Number(cashOnHand) || 0,
      monthlyFixedPayments: Number(monthlyFixedPayments) || 0,
      debtAmount: Number(debtAmount) || 0,
      monthlyIncome: income,
      isDependent: dependent,
      taxRate: estimateTaxRate(income, dependent),
      weeklyInvestment: Number(weeklyInvestment) || 0,
      goals,
    });
  };

  const canContinue =
    step === 0 ? cashOnHand !== "" :
    step === 1 ? monthlyFixedPayments !== "" :
    step === 2 ? debtAmount !== "" :
    step === 3 ? monthlyIncome !== "" :
    step === 4 ? isDependent !== null :
    step === 5 ? weeklyInvestment !== "" :
    goals.length > 0;

  const stepTitle =
    step === 6 ? "Your Goals" :
    step === 5 ? "Investing" :
    step === 4 ? "Tax Status" :
    "Let's get to know you";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-md overflow-hidden animate-slide-up">
        {/* Progress bar */}
        <div className="h-1 bg-[var(--color-background)]">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-[var(--color-glow)] flex items-center justify-center">
              <Target size={18} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-heading)]">{stepTitle}</h2>
              <p className="text-xs text-[var(--color-text-muted)]">Step {step + 1} of {totalSteps}</p>
            </div>
          </div>

          {/* Step content */}
          <div className="mt-6 mb-6">
            {step === 0 && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-2">
                  How much cash do you have on hand?
                </label>
                <p className="text-xs text-[var(--color-text-muted)] mb-3">
                  Include checking, savings, and any cash you have available.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                  <input
                    type="number"
                    value={cashOnHand}
                    onChange={(e) => setCashOnHand(e.target.value)}
                    className="w-full pl-7 pr-3 py-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    placeholder="0"
                    min="0"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-2">
                  Monthly fixed payments
                </label>
                <p className="text-xs text-[var(--color-text-muted)] mb-3">
                  Rent, subscriptions, car payments, insurance — things you pay every month.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                  <input
                    type="number"
                    value={monthlyFixedPayments}
                    onChange={(e) => setMonthlyFixedPayments(e.target.value)}
                    className="w-full pl-7 pr-3 py-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    placeholder="0"
                    min="0"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-2">
                  Total debt
                </label>
                <p className="text-xs text-[var(--color-text-muted)] mb-3">
                  Credit cards, student loans, any outstanding balances. Enter 0 if none.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                  <input
                    type="number"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    placeholder="0"
                    min="0"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-2">
                  Monthly income
                </label>
                <p className="text-xs text-[var(--color-text-muted)] mb-3">
                  Your general monthly income before taxes.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full pl-7 pr-3 py-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    placeholder="0"
                    min="0"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-2">
                  Are you claimed as a dependent?
                </label>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  This helps us calculate your tax estimate accurately. You're a dependent if a parent or guardian claims you on their tax return.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDependent(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium text-left transition-all cursor-pointer ${
                      isDependent === false
                        ? "border-[var(--color-primary)] bg-[var(--color-glow)] text-[var(--color-text-heading)]"
                        : "border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border)]/80"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isDependent === false ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-border)]"
                    }`}>
                      {isDependent === false && <Check size={12} className="text-[var(--color-primary-foreground)]" />}
                    </div>
                    No — I file independently
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDependent(true)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium text-left transition-all cursor-pointer ${
                      isDependent === true
                        ? "border-[var(--color-primary)] bg-[var(--color-glow)] text-[var(--color-text-heading)]"
                        : "border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border)]/80"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isDependent === true ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-border)]"
                    }`}>
                      {isDependent === true && <Check size={12} className="text-[var(--color-primary-foreground)]" />}
                    </div>
                    Yes — I'm claimed on someone else's return
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-2">
                  How much do you invest or save each week?
                </label>
                <p className="text-xs text-[var(--color-text-muted)] mb-3">
                  Any amount you regularly set aside — 401k contributions, savings transfers, brokerage deposits. Enter 0 if you don't invest yet.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                  <input
                    type="number"
                    value={weeklyInvestment}
                    onChange={(e) => setWeeklyInvestment(e.target.value)}
                    className="w-full pl-7 pr-3 py-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    placeholder="0"
                    min="0"
                    autoFocus
                  />
                  <span className="text-xs text-[var(--color-text-muted)] mt-2 block">per week</span>
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-2">
                  What are your primary goals? <span className="text-[var(--color-text-muted)] font-normal">(pick up to 3)</span>
                </label>
                <div className="space-y-2 mt-3">
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
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm font-medium cursor-pointer bg-transparent hover:bg-[var(--color-surface)] transition-colors"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            )}
            <button
              onClick={step === totalSteps - 1 ? handleSubmit : () => setStep(step + 1)}
              disabled={!canContinue}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold hover:brightness-110 transition-all cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === totalSteps - 1 ? "Get Started" : "Continue"}
              {step < totalSteps - 1 && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
