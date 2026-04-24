import { useState, useEffect, useCallback, useTransition } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useApp } from "../context/useApp";
import type { DailyLogEntry } from "../types/dailyLog";

type Range = "7d" | "30d" | "90d" | "all";

interface DataPoint {
  date: string;
  label: string;
  income: number;
  spending: number;
  savings: number;
  projected?: boolean;
}

export default function FinancialGraph() {
  const { currentUser } = useApp();
  const [range, setRange] = useState<Range>("30d");
  const [data, setData] = useState<DataPoint[]>([]);
  const [isPending, startTransition] = useTransition();

  const loadLogs = useCallback(async () => {
    if (!currentUser) return;
    const snap = await getDocs(collection(db, "users", currentUser.id, "dailyLogs"));
    const logs: DailyLogEntry[] = snap.docs.map((d) => d.data() as DailyLogEntry);
    logs.sort((a, b) => a.date.localeCompare(b.date));

    if (logs.length === 0) {
      setData([]);
      return;
    }

    // Determine date range
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    let startDate: string;
    if (range === "7d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString().slice(0, 10);
    } else if (range === "30d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      startDate = d.toISOString().slice(0, 10);
    } else if (range === "90d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 90);
      startDate = d.toISOString().slice(0, 10);
    } else {
      startDate = logs[0].date;
    }

    const filtered = logs.filter((l) => l.date >= startDate && l.date <= today);

    // Build cumulative data
    let cumIncome = 0;
    let cumSpending = 0;
    const points: DataPoint[] = filtered.map((log) => {
      const dayIncome = log.income.reduce((s, e) => s + e.amount, 0);
      const daySpending = log.spending.reduce((s, e) => s + e.amount, 0);
      cumIncome += dayIncome;
      cumSpending += daySpending;
      const d = new Date(log.date + "T12:00:00");
      return {
        date: log.date,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        income: cumIncome,
        spending: cumSpending,
        savings: cumIncome - cumSpending,
      };
    });

    // Add projection (7 days out based on daily averages)
    if (filtered.length >= 2) {
      const dayCount = Math.max(1, filtered.length);
      const avgDailyIncome = cumIncome / dayCount;
      const avgDailySpending = cumSpending / dayCount;

      for (let i = 1; i <= 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        cumIncome += avgDailyIncome;
        cumSpending += avgDailySpending;
        points.push({
          date: d.toISOString().slice(0, 10),
          label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          income: Math.round(cumIncome),
          spending: Math.round(cumSpending),
          savings: Math.round(cumIncome - cumSpending),
          projected: true,
        });
      }
    }

    setData(points);
  }, [currentUser, range]);

  useEffect(() => {
    startTransition(() => { loadLogs(); });
  }, [loadLogs]);

  const ranges: { key: Range; label: string }[] = [
    { key: "7d", label: "7D" },
    { key: "30d", label: "30D" },
    { key: "90d", label: "90D" },
    { key: "all", label: "All" },
  ];

  if (isPending) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
        <p className="text-sm text-[var(--color-text-muted)] text-center py-8">Loading chart...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
        <h3 className="text-base font-semibold text-[var(--color-text-heading)] mb-2">Financial Overview</h3>
        <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
          Start logging daily income and spending to see your financial graph.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[var(--color-text-heading)]">Financial Overview</h3>
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer border-0 transition-colors ${
                range === r.key
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="spendingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} />
          <YAxis tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} tickFormatter={(v: number) => `$${v}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`]}
          />
          <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
          <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" fill="url(#incomeGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="spending" name="Spending" stroke="#ef4444" fill="url(#spendingGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="savings" name="Savings" stroke="var(--color-primary)" fill="url(#savingsGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-xs text-[var(--color-text-muted)] text-center mt-3">
        {data.some((d) => d.projected) && "Dotted lines are projections. "}
        Projections are estimates based on your recent activity and are not financial advice.
      </p>
    </div>
  );
}
