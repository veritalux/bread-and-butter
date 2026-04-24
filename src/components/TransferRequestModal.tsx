import { useState } from "react";
import { X, ArrowRightLeft, Send } from "lucide-react";
import { useApp } from "../context/useApp";

interface Props {
  userId: string;
  userName: string;
  onClose: () => void;
}

export default function TransferRequestModal({ userId, userName, onClose }: Props) {
  const { requestTransfer } = useApp();
  const [coachCode, setCoachCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!coachCode.trim()) return;
    setError(null);
    setSubmitting(true);
    const res = await requestTransfer(userId, coachCode.trim());
    setSubmitting(false);
    if (res.ok) {
      setSuccess(true);
    } else {
      setError(res.error ?? "Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-sm p-6 animate-slide-up"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-[var(--color-primary)]" />
            <h3 className="font-bold text-[var(--color-text-heading)]">Transfer {userName}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[var(--color-surface-hover)] rounded-lg cursor-pointer bg-transparent border-0 text-[var(--color-text-muted)]">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <p className="text-sm text-[var(--color-text-heading)] font-medium mb-1">Transfer requested!</p>
            <p className="text-xs text-[var(--color-text-muted)]">{userName} will be notified and must accept before the transfer takes effect.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium cursor-pointer border-0"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Enter the coach code of the moderator you want to transfer this user to. The user will need to accept the transfer.
            </p>
            <input
              value={coachCode}
              onChange={(e) => setCoachCode(e.target.value.toUpperCase())}
              placeholder="Coach code (e.g., DAWS1A2B)"
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors mb-3 uppercase tracking-wider"
            />
            {error && (
              <p className="text-xs text-red-400 mb-3">{error}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={!coachCode.trim() || submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-semibold cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              {submitting ? "Requesting..." : "Request Transfer"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
