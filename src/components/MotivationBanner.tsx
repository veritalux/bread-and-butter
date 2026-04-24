import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { useApp } from "../context/useApp";

export default function MotivationBanner() {
  const { challenges } = useApp();

  const allLogs = challenges.flatMap((c) => c.logs);
  const totalAmount = allLogs.reduce((s, l) => s + l.amount, 0);

  // Compute date span from earliest log to today
  const [now] = useState(() => Date.now());
  let avgDaily = 0;
  if (allLogs.length > 0) {
    const dates = allLogs.map((l) => new Date(l.date).getTime());
    const earliest = Math.min(...dates);
    const daySpan = Math.max(1, Math.floor((now - earliest) / (1000 * 60 * 60 * 24)));
    avgDaily = totalAmount / daySpan;
  }

  const yearly = Math.round(avgDaily * 365);
  // Future value of annuity: yearly * ((1.1^10 - 1) / 0.1)
  const tenYear = Math.round(yearly * ((Math.pow(1.1, 10) - 1) / 0.1));

  const hasData = avgDaily > 0;

  return (
    <section className="mb-16">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-center animate-fade-in">
        <Lightbulb size={24} className="text-[var(--color-accent)] mx-auto mb-3" />
        {hasData ? (
          <>
            <p className="text-[var(--color-text-heading)] font-semibold text-lg mb-1">
              You're saving ~${avgDaily.toFixed(0)}/day = ${yearly.toLocaleString()}/year
            </p>
            <p className="text-[var(--color-text-muted)] text-sm max-w-md mx-auto">
              Invested at 10% return, that could be ${tenYear.toLocaleString()} in 10 years.{" "}
              <span className="text-[var(--color-primary)] font-medium">Keep going!</span>
            </p>
          </>
        ) : (
          <>
            <p className="text-[var(--color-text-heading)] font-semibold text-lg mb-1">
              Start logging to see your savings potential
            </p>
            <p className="text-[var(--color-text-muted)] text-sm max-w-md mx-auto">
              Even $5/day = $1,825/year. Invested at 10% return, that's $31,500 in 10 years.{" "}
              <span className="text-[var(--color-primary)] font-medium">Small changes, massive results.</span>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
