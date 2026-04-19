import { useState, useEffect, type ReactNode } from "react";
import type { Challenge, UserFinances } from "../types/challenge";
import type { AppUser, CheckInThreshold, CheckInLog } from "../types/user";
import { makeInitials, DEFAULT_THRESHOLD } from "../types/user";
import { sampleChallenges } from "../data/sampleData";
import { sampleUsers } from "../data/sampleUsers";
import { AppContext } from "./appContextDef";
import type { AppContextType, Theme } from "./appContextDef";
import type { FontChoice } from "../types/fonts";

const DEFAULT_FINANCES: UserFinances = { weeklyIncome: 1000, taxRate: 22, weeklyInvestment: 100 };

const NEW_USERS_KEY = "bb-new-users";
const CURRENT_USER_KEY = "bb-current-user";
const THEME_KEY = "bb-theme";
const FONT_KEY = "bb-font";

type StoredUser = Omit<AppUser, "challenges">;

function loadNewUsers(): StoredUser[] {
  const stored = localStorage.getItem(NEW_USERS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as StoredUser[];
  } catch {
    return [];
  }
}

function saveNewUsers(users: StoredUser[]) {
  localStorage.setItem(NEW_USERS_KEY, JSON.stringify(users));
}

function mergedUsers(newUsers: StoredUser[]): AppUser[] {
  const extras: AppUser[] = newUsers.map((u) => ({ ...u, challenges: [] }));
  return [...sampleUsers, ...extras];
}

function userChallengesKey(userId: string) {
  return `bb-challenges-${userId}`;
}
function userFinancesKey(userId: string) {
  return `bb-finances-${userId}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem(THEME_KEY) as Theme) || "dark";
  });
  const [font, setFontState] = useState<FontChoice>(() => {
    return (localStorage.getItem(FONT_KEY) as FontChoice) || "sans";
  });

  const [newUsers, setNewUsers] = useState<StoredUser[]>(() => loadNewUsers());

  const allUsers = mergedUsers(newUsers);

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const id = localStorage.getItem(CURRENT_USER_KEY);
    if (!id) return null;
    return mergedUsers(loadNewUsers()).find((u) => u.id === id) ?? null;
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const id = localStorage.getItem(CURRENT_USER_KEY);
    if (!id) return [];
    const stored = localStorage.getItem(userChallengesKey(id));
    if (stored) {
      try {
        return JSON.parse(stored) as Challenge[];
      } catch {
        // fall through
      }
    }
    const user = mergedUsers(loadNewUsers()).find((u) => u.id === id);
    if (user && user.role === "user") {
      return user.challenges.length > 0 ? user.challenges : sampleChallenges;
    }
    return [];
  });

  const [finances, setFinancesState] = useState<UserFinances>(() => {
    const id = localStorage.getItem(CURRENT_USER_KEY);
    if (!id) return DEFAULT_FINANCES;
    const stored = localStorage.getItem(userFinancesKey(id));
    if (stored) {
      try {
        return JSON.parse(stored) as UserFinances;
      } catch {
        // fall through
      }
    }
    return DEFAULT_FINANCES;
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  };

  const setFont = (f: FontChoice) => {
    setFontState(f);
    localStorage.setItem(FONT_KEY, f);
  };

  const setFinances = (f: UserFinances) => {
    setFinancesState(f);
    if (currentUser) {
      localStorage.setItem(userFinancesKey(currentUser.id), JSON.stringify(f));
    }
  };

  // --- Thresholds (per-user, moderator-set) ---
  const [thresholds, setThresholds] = useState<Record<string, CheckInThreshold>>(() => {
    const stored = localStorage.getItem("bb-thresholds");
    if (stored) { try { return JSON.parse(stored); } catch { /* fall through */ } }
    return {};
  });

  const getThreshold = (userId: string): CheckInThreshold =>
    thresholds[userId] ?? DEFAULT_THRESHOLD;

  const setThreshold = (userId: string, t: CheckInThreshold) => {
    setThresholds((prev) => {
      const next = { ...prev, [userId]: t };
      localStorage.setItem("bb-thresholds", JSON.stringify(next));
      return next;
    });
  };

  // --- Check-in logs (per-user) ---
  const [checkInLogs, setCheckInLogs] = useState<Record<string, CheckInLog[]>>(() => {
    const stored = localStorage.getItem("bb-checkin-logs");
    if (stored) { try { return JSON.parse(stored); } catch { /* fall through */ } }
    return {};
  });

  const getCheckInLogs = (userId: string): CheckInLog[] =>
    checkInLogs[userId] ?? [];

  const addCheckInLog = (userId: string, note: string) => {
    setCheckInLogs((prev) => {
      const entry: CheckInLog = {
        id: `cl-${Date.now()}`,
        date: new Date().toISOString(),
        note,
      };
      const next = { ...prev, [userId]: [...(prev[userId] ?? []), entry] };
      localStorage.setItem("bb-checkin-logs", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-font", font);
  }, [font]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(userChallengesKey(currentUser.id), JSON.stringify(challenges));
    }
  }, [challenges, currentUser]);

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

  const loadUserData = (user: AppUser) => {
    const storedChallenges = localStorage.getItem(userChallengesKey(user.id));
    if (storedChallenges) {
      try {
        setChallenges(JSON.parse(storedChallenges));
      } catch {
        setChallenges(user.challenges ?? []);
      }
    } else if (user.role === "user") {
      setChallenges(user.challenges.length > 0 ? user.challenges : sampleChallenges);
    } else {
      setChallenges([]);
    }

    const storedFin = localStorage.getItem(userFinancesKey(user.id));
    if (storedFin) {
      try {
        setFinancesState(JSON.parse(storedFin));
      } catch {
        setFinancesState(DEFAULT_FINANCES);
      }
    } else {
      setFinancesState(DEFAULT_FINANCES);
    }
  };

  const login: AppContextType["login"] = (email) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return { ok: false, error: "Email is required." };
    const user = allUsers.find((u) => u.email.toLowerCase() === normalized);
    if (!user) return { ok: false, error: "No account found for that email." };
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    loadUserData(user);
    return { ok: true, user };
  };

  const signUp: AppContextType["signUp"] = ({ name, email, role }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    if (!normalizedName) return { ok: false, error: "Name is required." };
    if (!normalizedEmail) return { ok: false, error: "Email is required." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { ok: false, error: "That doesn't look like a valid email." };
    }
    if (allUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { ok: false, error: "An account with that email already exists." };
    }
    const stored: StoredUser = {
      id: `${role === "moderator" ? "m" : "u"}-${Date.now()}`,
      name: normalizedName,
      initials: makeInitials(normalizedName),
      email: normalizedEmail,
      role,
      joinedDate: new Date().toISOString().slice(0, 10),
      lastActiveDate: new Date().toISOString().slice(0, 10),
      streak: 0,
      longestStreak: 0,
    };
    const updated = [...newUsers, stored];
    setNewUsers(updated);
    saveNewUsers(updated);
    const newUser: AppUser = { ...stored, challenges: [] };
    setCurrentUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, newUser.id);
    loadUserData(newUser);
    return { ok: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    setChallenges([]);
    setFinancesState(DEFAULT_FINANCES);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        font,
        setFont,
        currentUser,
        login,
        signUp,
        logout,
        allUsers,
        challenges,
        addChallenge,
        logProgress,
        finances,
        setFinances,
        getThreshold,
        setThreshold,
        getCheckInLogs,
        addCheckInLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

