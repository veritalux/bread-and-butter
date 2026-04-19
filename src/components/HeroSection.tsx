import { useState } from "react";
import { Rocket, ArrowRight } from "lucide-react";
import StartChallengeModal from "./StartChallengeModal";

export default function HeroSection() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden py-20 px-4 isolate">
        {/* Soft glow — kept behind content and gentle enough not to wash out text */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] rounded-full bg-[var(--color-primary)] opacity-[0.08] blur-[140px] animate-glow pointer-events-none -z-10"
        />

        <div className="relative max-w-2xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-glow)] text-[var(--color-primary)] border border-[var(--color-primary)]/30 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
            Short-term goals, long-term wins
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-heading)] leading-tight mb-4">
            Skip the latte.
            <br />
            <span className="text-[var(--color-primary)]">Stack your future.</span>
          </h1>

          <p className="text-[var(--color-text-muted)] text-lg max-w-lg mx-auto mb-8 leading-relaxed">
            Turn everyday spending habits into investment power. Set micro-challenges,
            track your wins, and watch small sacrifices compound into real wealth.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold hover:brightness-110 transition-all shadow-lg shadow-[var(--color-primary)]/20 cursor-pointer border-0"
            >
              <Rocket size={18} />
              Start a Challenge
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("how-it-works");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] font-medium hover:bg-[var(--color-surface)] transition-colors cursor-pointer bg-transparent"
            >
              See How It Works
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <StartChallengeModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
