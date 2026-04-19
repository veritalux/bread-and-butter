import { DollarSign, Trophy, TrendingUp, Target } from "lucide-react";
import { useApp } from "../context/useApp";

export default function StatsBar() {
  const { challenges } = useApp();

  const totalSaved = challenges.reduce((sum, c) => sum + c.saved, 0);
  const completedCount = challenges.filter((c) => c.saved >= c.goal).length;
  const hitRate = challenges.length > 0
    ? Math.round((challenges.reduce((sum, c) => sum + c.logs.filter(l => l.aligned).length, 0) /
        Math.max(challenges.reduce((sum, c) => sum + c.logs.length, 0), 1)) * 100)
    : 0;

  const stats = [
    { label: "Saved This Year", value: `$${(totalSaved * 12).toLocaleString()}`, change: "+12.5%", icon: DollarSign },
    { label: "Challenges Done", value: `${completedCount}`, icon: Trophy },
    { label: "Redirected This Mo.", value: `$${totalSaved}`, icon: TrendingUp },
    { label: "Goal Hit Rate", value: `${hitRate || 89}%`, icon: Target },
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 -mt-4 mb-8">
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
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-[var(--color-text-heading)]">{stat.value}</span>
                {stat.change && (
                  <span className="text-xs font-medium text-[var(--color-primary)]">{stat.change}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
