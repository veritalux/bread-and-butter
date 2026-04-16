import { Lightbulb } from "lucide-react";

export default function MotivationBanner() {
  return (
    <section className="max-w-5xl mx-auto px-4 mb-16">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-center animate-fade-in">
        <Lightbulb size={24} className="text-[var(--color-accent)] mx-auto mb-3" />
        <p className="text-[var(--color-text-heading)] font-semibold text-lg mb-1">
          "A $5 daily coffee habit = $1,825/year"
        </p>
        <p className="text-[var(--color-text-muted)] text-sm max-w-md mx-auto">
          Invested at 10% return, that's $31,500 in 10 years.{" "}
          <span className="text-[var(--color-primary)] font-medium">Small changes, massive results.</span>
        </p>
      </div>
    </section>
  );
}
