import { Shield } from "lucide-react";
import type { UserRole } from "../types/user";

const DISCLAIMER_TEXT: Record<UserRole, string> = {
  user: "Bread & Butter is a budgeting and accountability app, not an investment adviser, brokerage, bank, or money transmitter. Your moderator (and only your moderator) will be able to see everything that you enter into the web app.",
  moderator:
    "Bread & Butter is a budgeting and accountability app, not an investment adviser, brokerage, bank, or money transmitter. As a moderator, you are not permitted to give investment advice, nor are permitted to share any information that users enter into Bread & Butter in any way, including to those in the users' direct family.",
};

interface Props {
  role: UserRole;
  onAccept: () => void;
}

export default function DisclaimerModal({ role, onAccept }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--color-glow)] flex items-center justify-center">
            <Shield size={20} className="text-[var(--color-primary)]" />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text-heading)]">Before You Continue</h2>
        </div>

        <p className="text-sm text-[var(--color-text)] leading-relaxed mb-6">
          {DISCLAIMER_TEXT[role]}
        </p>

        <button
          onClick={onAccept}
          className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold hover:brightness-110 transition-all cursor-pointer border-0"
        >
          I understand
        </button>
      </div>
    </div>
  );
}
