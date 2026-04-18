import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, BookOpen, Type, LogOut, Check } from "lucide-react";
import { useApp, FONT_LABELS, type FontChoice } from "../context/AppContext";

const FONT_ORDER: FontChoice[] = ["sans", "serif", "mono", "rounded", "display"];

export default function Navbar() {
  const { theme, setTheme, font, setFont, currentUser, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [fontOpen, setFontOpen] = useState(false);
  const fontRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!fontOpen) return;
    const handler = (e: MouseEvent) => {
      if (fontRef.current && !fontRef.current.contains(e.target as Node)) {
        setFontOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [fontOpen]);

  const ThemeIcon = theme === "dark" ? Sun : theme === "light" ? BookOpen : Moon;
  const nextTheme = theme === "dark" ? "light" : theme === "light" ? "sepia" : "dark";

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          active
            ? "text-[var(--color-primary)] bg-[var(--color-glow)]"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        }`}
      >
        {label}
      </Link>
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isUser = currentUser?.role === "user";
  const isMod = currentUser?.role === "moderator";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[var(--color-background)]/80 border-b border-[var(--color-border)]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <Link
          to={isMod ? "/moderator" : "/"}
          className="flex items-center gap-2 text-[var(--color-text-heading)] font-bold text-lg no-underline"
        >
          <span className="text-2xl">🍞</span>
          Bread &amp; Butter
        </Link>

        <div className="flex items-center gap-1">
          {isUser && navLink("/", "Dashboard")}
          {isUser && navLink("/challenges", "Challenges")}
          {isMod && navLink("/moderator", "Moderator")}

          {/* Font selector */}
          <div ref={fontRef} className="relative ml-2">
            <button
              onClick={() => setFontOpen((v) => !v)}
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer bg-transparent border-0"
              title="Change font"
              aria-label="Change font"
            >
              <Type size={18} />
            </button>
            {fontOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden z-50">
                <p className="px-3 pt-2 pb-1 text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Font</p>
                {FONT_ORDER.map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFont(f); setFontOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer bg-transparent border-0 text-[var(--color-text)]"
                    data-font={f}
                    style={{ fontFamily: `var(--font-${f})` }}
                  >
                    <span>{FONT_LABELS[f]}</span>
                    {font === f && <Check size={14} className="text-[var(--color-primary)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(nextTheme)}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer bg-transparent border-0"
            title={`Switch to ${nextTheme} theme`}
            aria-label="Change theme"
          >
            <ThemeIcon size={18} />
          </button>

          {currentUser ? (
            <>
              <div
                className="ml-2 w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary-foreground)] text-xs font-bold"
                title={`${currentUser.name} · ${currentUser.email}`}
              >
                {currentUser.initials}
              </div>
              <button
                onClick={handleLogout}
                className="ml-1 p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer bg-transparent border-0"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="ml-2 px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-semibold no-underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
