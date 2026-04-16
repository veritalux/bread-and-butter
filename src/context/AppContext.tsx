import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Challenge, UserFinances } from "../types/challenge";
import { sampleChallenges } from "../data/sampleData";

type Theme = "dark" | "light" | "sepia";

interface AppContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  challenges: Challenge[];
  addChallenge: (c: Challenge) => void;
  logProgress: (challengeId: string, amount: number, note?: string) => void;
  finances: UserFinances;
  setFinances: (f: UserFinances) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("bb-theme") as Theme) || "dark";
  });
  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const stored = localStorage.getItem("bb-challenges");
    return stored ? JSON.parse(stored) : sampleChallenges;
  });
  const [finances, setFinancesState] = useState<UserFinances>(() => {
    const stored = localStorage.getItem("bb-finances");
    return stored ? JSON.parse(stored) : { weeklyIncome: 1000, taxRate: 22, weeklyInvestment: 100 };
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("bb-theme", t);
  };

  const setFinances = (f: UserFinances) => {
    setFinancesState(f);
    localStorage.setItem("bb-finances", JSON.stringify(f));
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("bb-challenges", JSON.stringify(challenges));
  }, [challenges]);

  const addChallenge = (c: Challenge) => {
    setChallenges((prev) => [c, ...prev]);
  };

  const logProgress = (challengeId: string, amount: number, note?: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id !== challengeId) return c;
        return {
          ...c,
          saved: Math.min(c.saved + amount, c.goal),
          logs: [
            ...c.logs,
            { date: new Date().toISOString(), aligned: true, amount, note },
          ],
        };
      })
    );
  };

  return (
    <AppContext.Provider value={{ theme, setTheme, challenges, addChallenge, logProgress, finances, setFinances }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
