import { useState } from "react";
import { Target, Trophy, TrendingUp, Sparkles, Rocket } from "lucide-react";
import { useApp } from "../context/useApp";
import { challengeTemplates, goalToTemplates, ChallengeIcon } from "../data/sampleData";
import ChallengeCard from "../components/ChallengeCard";
import ChallengeTracker from "../components/ChallengeTracker";
import StartChallengeModal from "../components/StartChallengeModal";

export default function Challenges() {
  const { challenges, onboardingData } = useApp();
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const active = challenges.filter((c) => c.saved < c.goal);
  const completed = challenges.filter((c) => c.saved >= c.goal);
  const totalRedirected = challenges.reduce((sum, c) => sum + c.saved, 0);
  const trackedChallenge = trackingId ? challenges.find((c) => c.id === trackingId) : null;

  // Build recommended templates from user goals
  const recommendedIds = new Set<string>();
  if (onboardingData?.goals) {
    for (const goal of onboardingData.goals) {
      const templates = goalToTemplates[goal];
      if (templates) templates.forEach((id) => recommendedIds.add(id));
    }
  }
  const recommended = challengeTemplates.filter((t) => recommendedIds.has(t.id));
  const allTemplates = challengeTemplates.filter((t) => !recommendedIds.has(t.id));

  const quickStats = [
    { label: "Active", value: active.length.toString(), icon: Target, color: "var(--color-primary)" },
    { label: "Completed", value: completed.length.toString(), icon: Trophy, color: "var(--color-accent)" },
    { label: "Total Redirected", value: `$${totalRedirected.toLocaleString()}`, icon: TrendingUp, color: "var(--color-primary)" },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-[var(--color-text-heading)] mb-2">Your Challenges</h1>
        <p className="text-[var(--color-text-muted)]">
          Track your active savings challenges and see how small daily wins compound into real investments.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {quickStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}>
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--color-text-heading)]">{stat.value}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommended for You */}
      {recommended.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-[var(--color-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">Recommended for You</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {recommended.map((t) => (
              <button
                key={t.id}
                onClick={() => setShowModal(true)}
                className="flex items-center gap-3 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)]/30 transition-all text-left cursor-pointer w-full"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--color-glow)] flex items-center justify-center shrink-0">
                  <ChallengeIcon name={t.icon} size={20} className="text-[var(--color-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--color-text-heading)]">{t.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{t.description}</p>
                </div>
                <Rocket size={14} className="text-[var(--color-primary)] shrink-0" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Active Challenges */}
      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Active</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((c, i) => (
              <div key={c.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <ChallengeCard
                  challenge={c}
                  onClick={() => setTrackingId(c.id)}
                  onLogProgress={() => setTrackingId(c.id)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed Challenges */}
      {completed.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Completed</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map((c, i) => (
              <div key={c.id} className="opacity-70 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <ChallengeCard challenge={c} onClick={() => setTrackingId(c.id)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Available Challenges */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">All Challenges</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {(recommended.length > 0 ? allTemplates : challengeTemplates).map((t) => (
            <button
              key={t.id}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-3 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)]/30 transition-all text-left cursor-pointer w-full"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--color-glow)] flex items-center justify-center shrink-0">
                <ChallengeIcon name={t.icon} size={20} className="text-[var(--color-primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[var(--color-text-heading)]">{t.title}</p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{t.description}</p>
              </div>
              {t.tag && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-glow)] text-[var(--color-primary)]">
                  {t.tag}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {trackedChallenge && (
        <ChallengeTracker challenge={trackedChallenge} onClose={() => setTrackingId(null)} />
      )}

      <StartChallengeModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </main>
  );
}
