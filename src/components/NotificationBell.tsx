import { useState, useRef, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { useApp } from "../context/useApp";

export default function NotificationBell() {
  const { notifications, respondToTransfer } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (notifications.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer bg-transparent border-0"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden z-50">
          <div className="px-3 pt-3 pb-2 border-b border-[var(--color-border)]">
            <p className="text-xs font-semibold text-[var(--color-text-heading)] uppercase tracking-wider">Notifications</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((n) => (
              <div key={n.id} className={`p-3 border-b border-[var(--color-border)] last:border-0 ${!n.read ? "bg-[var(--color-glow)]/30" : ""}`}>
                {n.type === "transfer-request" && (
                  <>
                    <p className="text-sm text-[var(--color-text)] mb-2">{n.message}</p>
                    {!n.read && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { respondToTransfer(n.data.transferRequestId, true); setOpen(false); }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs font-medium cursor-pointer border-0"
                        >
                          <Check size={12} /> Accept
                        </button>
                        <button
                          onClick={() => { respondToTransfer(n.data.transferRequestId, false); setOpen(false); }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-medium cursor-pointer bg-transparent"
                        >
                          <X size={12} /> Decline
                        </button>
                      </div>
                    )}
                    {n.read && (
                      <p className="text-xs text-[var(--color-text-muted)]">Responded</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
