import { DollarSign, Trophy, TrendingUp, Target } from "lucide-react";
import { useApp } from "../context/useApp";

export default function StatsBar() {
  const { challenges, dailyNetSaved } = useApp();

  const currentYear = new Date().getFullYear();
  const challengeSavedThisYear = challenges.reduce(
    (sum, c) =>
      sum +
      c.logs
        .filter((l) => new Date(l.date).getFullYear() === currentYear)
        .reduce((s, l) => s + l.amount, 0),
    0
  );
  const savedThisYear = challengeSavedThisYear + Math.max(0, dailyNetSaved);

  const completedCount = challenges.filter((c) => c.saved >= c.goal).length;
  const totalSaved = challenges.reduce((sum, c) => sum + c.saved, 0);

  const totalLogs = challenges.reduce((sum, c) => sum + c.logs.length, 0);
  const alignedLogs = challenges.reduce(
    (sum, c) => sum + c.logs.filter((l) => l.aligned).length,
    0
  );
  const hitRate = totalLogs > 0 ? Math.round((alignedLogs / totalLogs) * 100) : 0;

  const stats = [
    { label: "Saved This Year", value: `$${savedThisYear.toLocaleString()}`, icon: DollarSign },
    { label: "Challenges Done", value: `${completedCount}`, icon: Trophy },
    { label: "Total Redirected", value: `$${totalSaved}`, icon: TrendingUp },
    { label: "Goal Hit Rate", value: totalLogs > 0 ? `${hitRate}%` : "—", icon: Target },
  ];

  return (
    <section className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="text-[var(--color-primary)]" />
                <span className="text-xs text-[var(--color-text-muted)]">{stat.label}</span>
              </div>
              <span className="text-xl font-bold text-[var(--color-text-heading)]">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
