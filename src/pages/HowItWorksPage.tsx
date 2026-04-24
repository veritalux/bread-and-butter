import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";
import MotivationBanner from "../components/MotivationBanner";

export default function HowItWorksPage() {
  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <div className="max-w-5xl mx-auto px-4">
        <MotivationBanner />
      </div>
    </main>
  );
}
