import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";
import StatsBar from "../components/StatsBar";
import AccountabilityBanner from "../components/AccountabilityBanner";
import ChallengesSection from "../components/ChallengesSection";
import MotivationBanner from "../components/MotivationBanner";
import { useApp } from "../context/useApp";

export default function Dashboard() {
  const { currentUser, allUsers } = useApp();
  const streak = currentUser?.streak ?? 0;
  const longestStreak = currentUser?.longestStreak ?? 0;

  const moderator =
    currentUser?.moderatorId
      ? allUsers.find((u) => u.id === currentUser.moderatorId)
      : allUsers.find((u) => u.role === "moderator");

  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <StatsBar />
      <AccountabilityBanner
        streak={streak}
        longestStreak={longestStreak}
        moderatorName={moderator?.name ?? "your coach"}
      />
      <ChallengesSection />
      <MotivationBanner />
    </main>
  );
}
