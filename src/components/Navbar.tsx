import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, BookOpen } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const { theme, setTheme } = useApp();
  const location = useLocation();

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

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[var(--color-background)]/80 border-b border-[var(--color-border)]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-[var(--color-text-heading)] font-bold text-lg no-underline">
          <span className="text-2xl">🍞</span>
          Bread & Butter
        </Link>

        <div className="flex items-center gap-1">
          {navLink("/", "Dashboard")}
          {navLink("/challenges", "Challenges")}
          {navLink("/moderator", "Moderator")}
          <button
            onClick={() => setTheme(nextTheme)}
            className="ml-3 p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
            title={`Switch to ${nextTheme} theme`}
          >
            <ThemeIcon size={18} />
          </button>
          <div className="ml-2 w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold">
            BB
          </div>
        </div>
      </div>
    </nav>
  );
}
