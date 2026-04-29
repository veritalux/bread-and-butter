import { useState, useEffect, useCallback, useMemo, useTransition } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useApp } from "../context/useApp";
import type { DailyLogEntry } from "../types/dailyLog";

type Range = "7d" | "30d" | "90d" | "all";

function localDateStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface DataPoint {
  date: string;
  label: string;
  income: number;
  spending: number;
  savings: number;
  debt: number | null;
  invested: number;
  projected: boolean;
}

interface ChartDataPoint {
  date: string;
  label: string;
  income?: number;
  spending?: number;
  savings?: number;
  debt?: number | null;
  invested?: number;
  incomeProj?: number;
  spendingProj?: number;
  savingsProj?: number;
  debtProj?: number | null;
  investedProj?: number;
  projected: boolean;
}

export default function FinancialGraph() {
  const { currentUser, onboardingData } = useApp();
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

    const now = new Date();
    const today = localDateStr(now);
    let startDate: string;
    if (range === "7d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      startDate = localDateStr(d);
    } else if (range === "30d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      startDate = localDateStr(d);
    } else if (range === "90d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 90);
      startDate = localDateStr(d);
    } else {
      startDate = logs[0].date;
    }

    const filtered = logs.filter((l) => l.date >= startDate && l.date <= today);

    // Starting values from onboarding
    const startingDebt = onboardingData?.debtAmount ?? 0;
    const hasDebt = startingDebt > 0;

    // Build cumulative data
    let cumIncome = 0;
    let cumSpending = 0;
    let cumInvested = 0;
    const seen = new Set<string>();
    const points: DataPoint[] = [];

    for (const log of filtered) {
      // Skip duplicate dates
      if (seen.has(log.date)) continue;
      seen.add(log.date);

      const dayIncome = log.income.reduce((s, e) => s + e.amount, 0);
      const daySpending = log.spending.reduce((s, e) => s + e.amount, 0);
      const dayInvested = (log as unknown as { invested?: number }).invested ?? 0;
      cumIncome += dayIncome;
      cumSpending += daySpending;
      cumInvested += dayInvested;
      const d = new Date(log.date + "T12:00:00");
      points.push({
        date: log.date,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        income: cumIncome,
        spending: cumSpending,
        savings: cumIncome - cumSpending,
        debt: hasDebt ? Math.max(0, startingDebt) : null,
        invested: cumInvested,
        projected: false,
      });
    }

    // Add projection (7 days out based on daily averages)
    if (filtered.length >= 2) {
      const dayCount = Math.max(1, points.length);
      const avgDailyIncome = cumIncome / dayCount;
      const avgDailySpending = cumSpending / dayCount;
      const avgDailyInvested = cumInvested / dayCount;

      for (let i = 1; i <= 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        cumIncome += avgDailyIncome;
        cumSpending += avgDailySpending;
        cumInvested += avgDailyInvested;
        points.push({
          date: localDateStr(d),
          label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          income: Math.round(cumIncome),
          spending: Math.round(cumSpending),
          savings: Math.round(cumIncome - cumSpending),
          debt: hasDebt ? Math.max(0, startingDebt) : null,
          invested: Math.round(cumInvested),
          projected: true,
        });
      }
    }

    setData(points);
  }, [currentUser, range, onboardingData]);

  useEffect(() => {
    startTransition(() => { loadLogs(); });
  }, [loadLogs]);

  const ranges: { key: Range; label: string }[] = [
    { key: "7d", label: "7D" },
    { key: "30d", label: "30D" },
    { key: "90d", label: "90D" },
    { key: "all", label: "All" },
  ];

  // Split data into actual vs projected series for different stroke styles
  const projectionStartIndex = data.findIndex((d) => d.projected);
  const hasProjections = projectionStartIndex >= 0;
  const hasDebtData = data.some((d) => d.debt !== null && d.debt > 0);
  const hasInvestmentData = data.some((d) => d.invested > 0);

  // Label for today's x-axis position (used by ReferenceLine)
  const todayLabel = useMemo(() => {
    const todayStr = localDateStr(new Date());
    return data.find((d) => d.date === todayStr)?.label ?? null;
  }, [data]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!hasProjections) {
      // No projections — all data is actual
      return data.map((d) => ({
        ...d,
        incomeProj: undefined,
        spendingProj: undefined,
        savingsProj: undefined,
        debtProj: undefined,
        investedProj: undefined,
      }));
    }

    return data.map((d, i) => {
      // Bridge point: last actual point also appears in projected series for continuity
      const isBridge = i === projectionStartIndex - 1;

      if (d.projected) {
        return {
          date: d.date,
          label: d.label,
          projected: true,
          income: undefined,
          spending: undefined,
          savings: undefined,
          debt: undefined,
          invested: undefined,
          incomeProj: d.income,
          spendingProj: d.spending,
          savingsProj: d.savings,
          debtProj: d.debt,
          investedProj: d.invested,
        };
      }

      return {
        date: d.date,
        label: d.label,
        projected: false,
        income: d.income,
        spending: d.spending,
        savings: d.savings,
        debt: d.debt,
        invested: d.invested,
        // Bridge: duplicate values so projected lines connect seamlessly
        incomeProj: isBridge ? d.income : undefined,
        spendingProj: isBridge ? d.spending : undefined,
        savingsProj: isBridge ? d.savings : undefined,
        debtProj: isBridge ? d.debt : undefined,
        investedProj: isBridge ? d.invested : undefined,
      };
    });
  }, [data, hasProjections, projectionStartIndex]);

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

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
          <defs>
            <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
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
            formatter={(value: unknown, name: unknown) => {
              const v = Number(value);
              if (v === 0 && name === "Debt") return [null, null];
              if (value == null) return [null, null];
              const nameStr = String(name);
              const label = nameStr.endsWith(" (proj)") ? nameStr.replace(" (proj)", "") : nameStr;
              return [`$${v.toLocaleString()}`, label];
            }}
          />
          <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
          {/* Actual data — solid lines */}
          <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" fill="none" strokeWidth={2} connectNulls={false} />
          <Area type="monotone" dataKey="spending" name="Spending" stroke="#ef4444" fill="none" strokeWidth={2} connectNulls={false} />
          <Area type="monotone" dataKey="savings" name="Savings" stroke="var(--color-primary)" fill="url(#savingsGrad)" strokeWidth={2} connectNulls={false} />
          {hasDebtData && (
            <Area type="monotone" dataKey="debt" name="Debt" stroke="#f97316" fill="none" strokeWidth={2} strokeDasharray="6 3" connectNulls={false} />
          )}
          {hasInvestmentData && (
            <Area type="monotone" dataKey="invested" name="Invested" stroke="#8b5cf6" fill="none" strokeWidth={2} connectNulls={false} />
          )}
          {/* Today marker — vertical reference line at the boundary between actual and projected */}
          {hasProjections && todayLabel && (
            <ReferenceLine
              x={todayLabel}
              stroke="var(--color-text-muted)"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={{ value: "Today", position: "insideTopRight", fontSize: 9, fill: "var(--color-text-muted)" }}
            />
          )}
          {/* Projected data — dotted lines */}
          {hasProjections && (
            <>
              <Area type="monotone" dataKey="incomeProj" name="Income (proj)" stroke="#10B981" fill="none" strokeWidth={2} strokeDasharray="4 4" connectNulls={false} legendType="none" />
              <Area type="monotone" dataKey="spendingProj" name="Spending (proj)" stroke="#ef4444" fill="none" strokeWidth={2} strokeDasharray="4 4" connectNulls={false} legendType="none" />
              <Area type="monotone" dataKey="savingsProj" name="Savings (proj)" stroke="var(--color-primary)" fill="none" strokeWidth={2} strokeDasharray="4 4" connectNulls={false} legendType="none" />
              {hasDebtData && (
                <Area type="monotone" dataKey="debtProj" name="Debt (proj)" stroke="#f97316" fill="none" strokeWidth={2} strokeDasharray="4 4" connectNulls={false} legendType="none" />
              )}
              {hasInvestmentData && (
                <Area type="monotone" dataKey="investedProj" name="Invested (proj)" stroke="#8b5cf6" fill="none" strokeWidth={2} strokeDasharray="4 4" connectNulls={false} legendType="none" />
              )}
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-xs text-[var(--color-text-muted)] text-center mt-3">
        {hasProjections && "Projected data shown after current date. "}
        Projections are estimates based on your recent activity and are not financial advice.
      </p>
    </div>
  );
}
