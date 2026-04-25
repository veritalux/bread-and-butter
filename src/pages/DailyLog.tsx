import { useState, useEffect, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Save,
  Flame,
} from "lucide-react";
import { useApp } from "../context/useApp";
import { SPENDING_CATEGORIES } from "../types/dailyLog";
import type { IncomeEntry, SpendingEntry } from "../types/dailyLog";

function toDateStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function DailyLog() {
  const { currentUser, saveDailyLog, loadDailyLog } = useApp();
  const [date, setDate] = useState(toDateStr());
  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [spending, setSpending] = useState<SpendingEntry[]>([]);
  const [invested, setInvested] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isToday = date === toDateStr();

  useEffect(() => {
    let cancelled = false;
    startTransition(() => {
      loadDailyLog(date).then((entry) => {
        if (cancelled) return;
        if (entry) {
          setIncome(entry.income);
          setSpending(entry.spending);
          setInvested(String(entry.invested ?? 0));
        } else {
          setIncome([]);
          setSpending([]);
          setInvested("");
        }
        setSaved(false);
      });
    });
    return () => { cancelled = true; };
  }, [date, loadDailyLog]);

  const changeDate = (delta: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + delta);
    if (d <= new Date()) setDate(toDateStr(d));
  };

  const addIncome = () => setIncome([...income, { amount: 0, source: "" }]);
  const addSpending = () => setSpending([...spending, { amount: 0, category: "food" }]);

  const updateIncome = (i: number, field: keyof IncomeEntry, value: string | number) => {
    setIncome((prev) => prev.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)));
    setSaved(false);
  };
  const updateSpending = (i: number, field: keyof SpendingEntry, value: string | number) => {
    setSpending((prev) => prev.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)));
    setSaved(false);
  };

  const removeIncome = (i: number) => { setIncome((prev) => prev.filter((_, idx) => idx !== i)); setSaved(false); };
  const removeSpending = (i: number) => { setSpending((prev) => prev.filter((_, idx) => idx !== i)); setSaved(false); };

  const totalIncome = income.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalSpending = spending.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const net = totalIncome - totalSpending;

  const handleSave = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    await saveDailyLog({
      date,
      income: income.filter((e) => e.amount > 0),
      spending: spending.filter((e) => e.amount > 0),
      invested: Number(invested) || 0,
      createdAt: now,
      updatedAt: now,
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Daily Log</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Log your income and spending to build your streak.</p>
        </div>
        {currentUser && (
          <div className="flex items-center gap-1.5 text-sm">
            <Flame size={16} className={currentUser.streak > 0 ? "text-orange-400" : "text-[var(--color-text-muted)]"} />
            <span className={currentUser.streak > 0 ? "font-bold text-[var(--color-text-heading)]" : "text-[var(--color-text-muted)]"}>
              {currentUser.streak}d streak
            </span>
          </div>
        )}
      </div>

      {/* Date selector */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] cursor-pointer bg-transparent border-0 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold text-[var(--color-text-heading)]">{formatDate(date)}</p>
          {isToday && <p className="text-xs text-[var(--color-primary)]">Today</p>}
        </div>
        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] cursor-pointer bg-transparent border-0 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {isPending ? (
        <div className="text-center py-16 text-[var(--color-text-muted)] text-sm">Loading...</div>
      ) : (
        <>
          {/* Income section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-green-500" />
                <h2 className="text-base font-semibold text-[var(--color-text-heading)]">Income</h2>
              </div>
              <button
                onClick={addIncome}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] cursor-pointer bg-transparent border-0"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {income.length === 0 ? (
              <button
                onClick={addIncome}
                className="w-full py-6 rounded-xl border-2 border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/30 transition-colors cursor-pointer bg-transparent"
              >
                + Add income entry
              </button>
            ) : (
              <div className="space-y-2">
                {income.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">$</span>
                      <input
                        type="number"
                        value={entry.amount || ""}
                        onChange={(e) => updateIncome(i, "amount", Number(e.target.value))}
                        placeholder="0"
                        className="w-full pl-6 pr-2 py-1.5 rounded-md bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      />
                    </div>
                    <input
                      value={entry.source}
                      onChange={(e) => updateIncome(i, "source", e.target.value)}
                      placeholder="Source (e.g., paycheck)"
                      className="flex-[2] px-2.5 py-1.5 rounded-md bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    />
                    <button onClick={() => removeIncome(i)} className="p-1 text-[var(--color-text-muted)] hover:text-red-400 cursor-pointer bg-transparent border-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Spending section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} className="text-red-400" />
                <h2 className="text-base font-semibold text-[var(--color-text-heading)]">Spending</h2>
              </div>
              <button
                onClick={addSpending}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] cursor-pointer bg-transparent border-0"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {spending.length === 0 ? (
              <button
                onClick={addSpending}
                className="w-full py-6 rounded-xl border-2 border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/30 transition-colors cursor-pointer bg-transparent"
              >
                + Add spending entry
              </button>
            ) : (
              <div className="space-y-2">
                {spending.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">$</span>
                      <input
                        type="number"
                        value={entry.amount || ""}
                        onChange={(e) => updateSpending(i, "amount", Number(e.target.value))}
                        placeholder="0"
                        className="w-full pl-6 pr-2 py-1.5 rounded-md bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      />
                    </div>
                    <select
                      value={entry.category}
                      onChange={(e) => updateSpending(i, "category", e.target.value)}
                      className="flex-[2] px-2.5 py-1.5 rounded-md bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    >
                      {SPENDING_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                    <button onClick={() => removeSpending(i)} className="p-1 text-[var(--color-text-muted)] hover:text-red-400 cursor-pointer bg-transparent border-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Invested */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-purple-500" />
              <h2 className="text-base font-semibold text-[var(--color-text-heading)]">Invested Today</h2>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">$</span>
                <input
                  type="number"
                  value={invested}
                  onChange={(e) => { setInvested(e.target.value); setSaved(false); }}
                  placeholder="0"
                  className="w-full pl-6 pr-2 py-1.5 rounded-md bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5">401k, savings transfers, brokerage deposits — any amount moved to investments today.</p>
            </div>
          </section>

          {/* Summary */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 mb-6">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Income</p>
                <p className="text-lg font-bold text-green-500">${totalIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Spent</p>
                <p className="text-lg font-bold text-red-400">${totalSpending.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Invested</p>
                <p className="text-lg font-bold text-purple-500">${(Number(invested) || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Net</p>
                <p className={`text-lg font-bold ${net >= 0 ? "text-[var(--color-primary)]" : "text-red-400"}`}>
                  {net >= 0 ? "+" : ""}${net.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || (income.length === 0 && spending.length === 0)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold hover:brightness-110 transition-all cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? "Saving..." : saved ? "Saved!" : "Save Today's Log"}
          </button>
        </>
      )}
    </main>
  );
}
