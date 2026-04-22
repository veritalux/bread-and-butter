import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Shield, User as UserIcon } from "lucide-react";
import { useApp } from "../context/useApp";
import type { UserRole } from "../types/user";

type Mode = "login" | "signup";

export default function Login() {
  const { login, signUp, currentUser } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const target = currentUser.role === "moderator" ? "/moderator" : "/";
      navigate(target, { replace: true });
    }
  }, [currentUser, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = mode === "login"
        ? await login(email, password)
        : await signUp({ name, email, password, role });

      if (!res.ok) {
        setError(res.error);
        return;
      }
      const target = res.user.role === "moderator" ? "/moderator" : "/";
      navigate(target, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100svh-3.5rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 animate-fade-in">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="w-10 h-10 mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-[var(--color-text-heading)]">Bread &amp; Butter</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {mode === "login" ? "Sign in to track your challenges." : "Create your account."}
          </p>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-5 p-1 bg-[var(--color-background)] rounded-lg">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer border-0 ${
                mode === "login"
                  ? "bg-[var(--color-surface)] text-[var(--color-text-heading)] shadow-sm"
                  : "bg-transparent text-[var(--color-text-muted)]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer border-0 ${
                mode === "signup"
                  ? "bg-[var(--color-surface)] text-[var(--color-text-heading)] shadow-sm"
                  : "bg-transparent text-[var(--color-text-muted)]"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-heading)] mb-1.5">Your name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  placeholder="Your Name"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-heading)] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-heading)] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-heading)] mb-1.5">Account type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                      role === "user"
                        ? "border-[var(--color-primary)] bg-[var(--color-glow)] text-[var(--color-text-heading)]"
                        : "border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)]"
                    }`}
                  >
                    <UserIcon size={16} />
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("moderator")}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                      role === "moderator"
                        ? "border-[var(--color-primary)] bg-[var(--color-glow)] text-[var(--color-text-heading)]"
                        : "border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)]"
                    }`}
                  >
                    <Shield size={16} />
                    Moderator
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-[var(--color-danger)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold hover:brightness-110 transition-all cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
              {submitting ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
