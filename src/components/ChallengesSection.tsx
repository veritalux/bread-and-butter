import { useState } from "react";
import { Plus } from "lucide-react";
import { useApp } from "../context/useApp";
import ChallengeCard from "./ChallengeCard";
import ChallengeTracker from "./ChallengeTracker";
import StartChallengeModal from "./StartChallengeModal";

export default function ChallengesSection() {
  const { challenges, logProgress } = useApp();
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const activeChallenges = challenges.filter((c) => c.saved < c.goal);

  const trackedChallenge = trackingId ? challenges.find((c) => c.id === trackingId) : null;

  return (
    <>
      <section className="max-w-5xl mx-auto px-4 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--color-text-heading)]">Active Challenges</h2>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors cursor-pointer bg-transparent border-0"
          >
            <Plus size={16} />
            New Challenge
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeChallenges.map((c, i) => (
            <div key={c.id} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <ChallengeCard
                challenge={c}
                onClick={() => setTrackingId(c.id)}
                onLogProgress={() => {
                  logProgress(c.id, 5);
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {trackedChallenge && (
        <ChallengeTracker
          challenge={trackedChallenge}
          onClose={() => setTrackingId(null)}
        />
      )}

      <StartChallengeModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
