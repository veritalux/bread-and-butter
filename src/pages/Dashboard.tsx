import HeroSection from "../components/HeroSection";
import StatsBar from "../components/StatsBar";
import AccountabilityBanner from "../components/AccountabilityBanner";
import ChallengesSection from "../components/ChallengesSection";
import MotivationBanner from "../components/MotivationBanner";

export default function Dashboard() {
  // In a real app these would come from the logged-in user's profile
  const streak = 12;
  const longestStreak = 18;

  return (
    <main>
      <HeroSection />
      <StatsBar />
      <AccountabilityBanner streak={streak} longestStreak={longestStreak} />
      <ChallengesSection />
      <MotivationBanner />
    </main>
  );
}
