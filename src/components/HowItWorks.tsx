import { Target, TrendingUp, Users } from "lucide-react";

const steps = [
  {
    icon: Target,
    title: "Pick a challenge",
    description:
      "Choose a micro-savings challenge — skip coffee, pause impulse buys, meal-prep for a week. Set your goal and timeline.",
  },
  {
    icon: TrendingUp,
    title: "Track daily wins",
    description:
      "Log each day you stick with it. Watch your savings grow and your streak climb as small sacrifices add up.",
  },
  {
    icon: Users,
    title: "Stay accountable",
    description:
      "Your coach checks in when you go quiet. Having someone in your corner keeps you honest and on track.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-5xl mx-auto px-4 py-14">
      <h2 className="text-2xl font-bold text-[var(--color-text-heading)] text-center mb-2">
        How It Works
      </h2>
      <p className="text-[var(--color-text-muted)] text-center mb-10 max-w-lg mx-auto">
        Three steps to turn everyday spending into long-term wealth.
      </p>

      <div className="grid sm:grid-cols-3 gap-6">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={i}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-center animate-fade-in"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-glow)] flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-[var(--color-primary)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text-heading)] mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
