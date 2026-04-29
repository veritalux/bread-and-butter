import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { Challenge, UserFinances } from "../types/challenge";
import { computeDaysLeft } from "../types/challenge";
import type { AppUser, CheckInThreshold, CheckInLog } from "../types/user";
import { makeInitials, DEFAULT_THRESHOLD, CURRENT_ACCOUNT_VERSION } from "../types/user";
import type { OnboardingData } from "../types/onboarding";
import type { DailyLogEntry } from "../types/dailyLog";
import type { UserNotification } from "../types/notification";
import { AppContext } from "./appContextDef";
import type { Theme } from "./appContextDef";
import type { FontChoice } from "../types/fonts";
import { migrateAccount } from "../lib/accountMigrations";

const DEFAULT_FINANCES: UserFinances = { weeklyIncome: 1000, taxRate: 22, weeklyInvestment: 0 };
const THEME_KEY = "bb-theme";
const FONT_KEY = "bb-font";

function toDateStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateStr(d);
}

async function loadUserDoc(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { id: uid, ...snap.data() } as AppUser;
}

async function loadChallenges(uid: string): Promise<Challenge[]> {
  const snap = await getDocs(collection(db, "users", uid, "challenges"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Challenge);
}

async function loadCheckInLogs(userId: string): Promise<CheckInLog[]> {
  const snap = await getDocs(collection(db, "users", userId, "checkInLogs"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CheckInLog);
}

async function loadThresholds(moderatorId: string): Promise<Record<string, CheckInThreshold>> {
  const snap = await getDocs(collection(db, "moderatorSettings", moderatorId, "thresholds"));
  const result: Record<string, CheckInThreshold> = {};
  snap.docs.forEach((d) => {
    result[d.id] = d.data() as CheckInThreshold;
  });
  return result;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [finances, setFinancesState] = useState<UserFinances>(DEFAULT_FINANCES);
  const [thresholds, setThresholds] = useState<Record<string, CheckInThreshold>>({});
  const [checkInLogs, setCheckInLogs] = useState<Record<string, CheckInLog[]>>({});
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(THEME_KEY) as Theme) || "dark"
  );
  const [font, setFontState] = useState<FontChoice>(
    () => (localStorage.getItem(FONT_KEY) as FontChoice) || "sans"
  );

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  };
  const setFont = (f: FontChoice) => {
    setFontState(f);
    localStorage.setItem(FONT_KEY, f);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.setAttribute("data-font", font);
  }, [font]);

  // --- Auth state listener ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await loadUserDoc(firebaseUser.uid);
        if (userDoc) {
          // Run any pending account migrations
          const migratedUser = await migrateAccount(userDoc);
          setCurrentUser(migratedUser);
          const userChallenges = await loadChallenges(firebaseUser.uid);
          setChallenges(userChallenges);
          // Load finances from user doc
          const finSnap = await getDoc(doc(db, "users", firebaseUser.uid, "settings", "finances"));
          if (finSnap.exists()) {
            setFinancesState(finSnap.data() as UserFinances);
          }
          // Load onboarding data
          const onbSnap = await getDoc(doc(db, "users", firebaseUser.uid, "settings", "onboarding"));
          if (onbSnap.exists()) {
            setOnboardingData(onbSnap.data() as OnboardingData);
          } else {
            setOnboardingData(null);
          }
          // If moderator, load thresholds
          if (userDoc.role === "moderator") {
            const t = await loadThresholds(firebaseUser.uid);
            setThresholds(t);
          }
        }
      } else {
        setCurrentUser(null);
        setChallenges([]);
        setFinancesState(DEFAULT_FINANCES);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // --- Real-time listener for all users (moderator needs this) ---
  useEffect(() => {
    if (!currentUser) return;
    const q = currentUser.role === "moderator"
      ? query(collection(db, "users"), where("role", "==", "user"), where("moderatorId", "==", currentUser.id))
      : collection(db, "users");

    const unsub = onSnapshot(q, async (snap) => {
      const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppUser);
      // For moderators, run any pending migrations on each visible user so accounts
      // receive updates even if those users haven't logged in recently.
      if (currentUser.role === "moderator") {
        const migrated = await Promise.all(users.map((u) => migrateAccount(u)));
        setAllUsers(migrated);
      } else {
        setAllUsers(users);
      }
    });
    return unsub;
  }, [currentUser]);

  // --- Load check-in logs for all users when moderator ---
  useEffect(() => {
    if (!currentUser || currentUser.role !== "moderator") return;

    async function loadAllCheckIns() {
      const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "user"), where("moderatorId", "==", currentUser!.id)));
      const logs: Record<string, CheckInLog[]> = {};
      for (const userDoc of usersSnap.docs) {
        logs[userDoc.id] = await loadCheckInLogs(userDoc.id);
      }
      setCheckInLogs(logs);
    }
    loadAllCheckIns();
  }, [currentUser]);

  // --- Notifications listener for users ---
  useEffect(() => {
    if (!currentUser || currentUser.role !== "user") return;
    const unsub = onSnapshot(collection(db, "users", currentUser.id, "notifications"), (snap) => {
      const notifs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserNotification);
      notifs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setNotifications(notifs);
    });
    return unsub;
  }, [currentUser]);

  // Challenges with computed daysLeft
  const challengesWithDaysLeft = challenges.map((c) => ({
    ...c,
    daysLeft: c.startDate ? computeDaysLeft(c.startDate, c.totalDays) : 0,
  }));

  // --- Auth functions ---
  const login = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await loadUserDoc(cred.user.uid);
      if (!userDoc) return { ok: false as const, error: "User profile not found." };
      setCurrentUser(userDoc);
      const userChallenges = await loadChallenges(cred.user.uid);
      setChallenges(userChallenges);
      return { ok: true as const, user: userDoc };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        return { ok: false as const, error: "Invalid email or password." };
      }
      if (code === "auth/wrong-password") {
        return { ok: false as const, error: "Invalid email or password." };
      }
      return { ok: false as const, error: "Something went wrong. Please try again." };
    }
  };

  const signUp = async ({ name, email, password, role, code }: { name: string; email: string; password: string; role: string; code: string }) => {
    try {
      const trimmedCode = code.trim();

      if (role === "moderator") {
        // Moderators need the master signup code
        if (trimmedCode !== "BREADANDBUTTER2026") {
          return { ok: false as const, error: "Invalid moderator access code." };
        }
      }

      let moderatorId: string | undefined;
      if (role === "user") {
        // Users must enter a valid coach code — look up the moderator
        const modQuery = query(collection(db, "users"), where("coachCode", "==", trimmedCode.toUpperCase()));
        const modSnap = await getDocs(modQuery);
        if (modSnap.empty) {
          return { ok: false as const, error: "Invalid coach code. Ask your coach for their code." };
        }
        moderatorId = modSnap.docs[0].id;
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const today = toDateStr();

      // Generate a unique coach code for moderators
      const coachCode = role === "moderator"
        ? name.trim().split(/\s+/).pop()!.toUpperCase().slice(0, 4) + cred.user.uid.slice(0, 4).toUpperCase()
        : undefined;

      const newUser: AppUser = {
        id: cred.user.uid,
        name: name.trim(),
        initials: makeInitials(name),
        email: email.trim().toLowerCase(),
        role: role as AppUser["role"],
        joinedDate: today,
        lastActiveDate: today,
        streak: 0,
        longestStreak: 0,
        accountVersion: CURRENT_ACCOUNT_VERSION,
        ...(moderatorId ? { moderatorId } : {}),
        ...(coachCode ? { coachCode } : {}),
      };
      // Write user doc (omit id — it's the doc key)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, ...userData } = newUser;
      await setDoc(doc(db, "users", cred.user.uid), userData);
      setCurrentUser(newUser);
      setChallenges([]);
      return { ok: true as const, user: newUser };
    } catch (err: unknown) {
      const errCode = (err as { code?: string }).code;
      if (errCode === "auth/email-already-in-use") {
        return { ok: false as const, error: "An account with that email already exists." };
      }
      if (errCode === "auth/weak-password") {
        return { ok: false as const, error: "Password must be at least 6 characters." };
      }
      return { ok: false as const, error: "Something went wrong. Please try again." };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setChallenges([]);
    setAllUsers([]);
    setFinancesState(DEFAULT_FINANCES);
  };

  // --- Challenge functions ---
  const addChallenge = async (c: Challenge) => {
    if (!currentUser) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...data } = c;
    const ref = await addDoc(collection(db, "users", currentUser.id, "challenges"), data);
    setChallenges((prev) => [{ ...c, id: ref.id }, ...prev]);
  };

  const logProgress = async (challengeId: string, amount: number, note?: string) => {
    if (!currentUser) return;
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    const newSaved = Math.min(challenge.saved + amount, challenge.goal);
    const logEntry = { date: new Date().toISOString(), aligned: true, amount, note: note ?? "" };
    const newLogs = [...challenge.logs, logEntry];

    // Update challenge in Firestore
    await updateDoc(doc(db, "users", currentUser.id, "challenges", challengeId), {
      saved: newSaved,
      logs: newLogs,
    });

    // Update local challenge state
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === challengeId ? { ...c, saved: newSaved, logs: newLogs } : c
      )
    );

    // --- Streak logic ---
    const today = toDateStr();
    const lastActive = currentUser.lastActiveDate;
    let newStreak = currentUser.streak;
    if (lastActive === today) {
      // Already logged today — keep streak, but start at 1 if it was 0
      if (newStreak === 0) newStreak = 1;
    } else if (lastActive === yesterday()) {
      newStreak = currentUser.streak + 1;
    } else {
      newStreak = 1;
    }
    const newLongest = Math.max(currentUser.longestStreak, newStreak);

    // Update user doc
    await updateDoc(doc(db, "users", currentUser.id), {
      lastActiveDate: today,
      streak: newStreak,
      longestStreak: newLongest,
    });

    setCurrentUser((prev) =>
      prev ? { ...prev, lastActiveDate: today, streak: newStreak, longestStreak: newLongest } : prev
    );
  };

  // --- Finances ---
  const setFinances = useCallback(async (f: UserFinances) => {
    setFinancesState(f);
    if (currentUser) {
      await setDoc(doc(db, "users", currentUser.id, "settings", "finances"), f);
    }
  }, [currentUser]);

  // --- Thresholds ---
  const getThreshold = (userId: string): CheckInThreshold =>
    thresholds[userId] ?? DEFAULT_THRESHOLD;

  const setThreshold = async (userId: string, t: CheckInThreshold) => {
    if (!currentUser) return;
    await setDoc(doc(db, "moderatorSettings", currentUser.id, "thresholds", userId), t);
    setThresholds((prev) => ({ ...prev, [userId]: t }));
  };

  // --- Check-in logs ---
  const getCheckInLogs = (userId: string): CheckInLog[] =>
    checkInLogs[userId] ?? [];

  const addCheckInLog = async (userId: string, note: string) => {
    if (!currentUser) return;
    const entry = {
      date: new Date().toISOString(),
      note,
      moderatorId: currentUser.id,
    };
    const ref = await addDoc(collection(db, "users", userId, "checkInLogs"), entry);
    const newLog: CheckInLog = { id: ref.id, ...entry };
    setCheckInLogs((prev) => ({
      ...prev,
      [userId]: [...(prev[userId] ?? []), newLog],
    }));
  };

  // --- Transfer ---
  const requestTransfer = async (userId: string, toCoachCode: string): Promise<{ ok: boolean; error?: string }> => {
    if (!currentUser) return { ok: false, error: "Not logged in." };
    // Look up target moderator
    const modSnap = await getDocs(query(collection(db, "users"), where("coachCode", "==", toCoachCode.toUpperCase())));
    if (modSnap.empty) return { ok: false, error: "No moderator found with that coach code." };
    const targetMod = modSnap.docs[0];
    if (targetMod.id === currentUser.id) return { ok: false, error: "That's your own coach code." };

    const now = new Date().toISOString();
    const targetModData = targetMod.data();
    // Create transfer request
    const transferRef = await addDoc(collection(db, "transferRequests"), {
      userId,
      fromModeratorId: currentUser.id,
      toModeratorId: targetMod.id,
      toModeratorName: targetModData.name,
      status: "pending",
      createdAt: now,
    });
    // Create notification for the user
    await addDoc(collection(db, "users", userId, "notifications"), {
      type: "transfer-request",
      message: `Your coach ${currentUser.name} has requested to transfer you to ${targetModData.name}. Do you consent to them seeing and helping you with the financial data you have entered?`,
      data: { transferRequestId: transferRef.id, toModeratorName: targetModData.name, toModeratorId: targetMod.id },
      read: false,
      createdAt: now,
    });
    return { ok: true };
  };

  const respondToTransfer = async (transferRequestId: string, accept: boolean) => {
    if (!currentUser) return;
    const transferSnap = await getDoc(doc(db, "transferRequests", transferRequestId));
    if (!transferSnap.exists()) return;
    const transfer = transferSnap.data();

    const now = new Date().toISOString();
    await updateDoc(doc(db, "transferRequests", transferRequestId), {
      status: accept ? "accepted" : "rejected",
      respondedAt: now,
    });

    if (accept) {
      // Update user's moderatorId
      await updateDoc(doc(db, "users", currentUser.id), { moderatorId: transfer.toModeratorId });
      setCurrentUser((prev) => prev ? { ...prev, moderatorId: transfer.toModeratorId } : prev);
    }

    // Mark notification as read
    const notifsSnap = await getDocs(collection(db, "users", currentUser.id, "notifications"));
    for (const notifDoc of notifsSnap.docs) {
      const data = notifDoc.data();
      if (data.data?.transferRequestId === transferRequestId) {
        await updateDoc(doc(db, "users", currentUser.id, "notifications", notifDoc.id), { read: true });
      }
    }
  };

  // --- Onboarding ---
  const completeOnboarding = async (data: OnboardingData) => {
    if (!currentUser) return;
    const timestamp = new Date().toISOString();
    await setDoc(doc(db, "users", currentUser.id, "settings", "onboarding"), data);
    await updateDoc(doc(db, "users", currentUser.id), { onboardingCompletedAt: timestamp });
    // Save tax rate and investment to finances settings
    const updatedFinances: UserFinances = {
      weeklyIncome: Math.round(data.monthlyIncome / 4),
      taxRate: data.taxRate,
      weeklyInvestment: data.weeklyInvestment,
    };
    await setDoc(doc(db, "users", currentUser.id, "settings", "finances"), updatedFinances);
    setFinancesState(updatedFinances);
    setOnboardingData(data);
    setCurrentUser((prev) => prev ? { ...prev, onboardingCompletedAt: timestamp } : prev);
  };

  // --- Daily Log ---
  const saveDailyLog = useCallback(async (entry: DailyLogEntry) => {
    if (!currentUser) return;
    await setDoc(doc(db, "users", currentUser.id, "dailyLogs", entry.date), entry);

    // Update streak based on daily log
    const today = toDateStr();
    const lastActive = currentUser.lastActiveDate;
    let newStreak = currentUser.streak;
    if (lastActive === today) {
      if (newStreak === 0) newStreak = 1;
    } else if (lastActive === yesterday()) {
      newStreak = currentUser.streak + 1;
    } else {
      newStreak = 1;
    }
    const newLongest = Math.max(currentUser.longestStreak, newStreak);

    await updateDoc(doc(db, "users", currentUser.id), {
      lastActiveDate: today,
      streak: newStreak,
      longestStreak: newLongest,
    });

    setCurrentUser((prev) =>
      prev ? { ...prev, lastActiveDate: today, streak: newStreak, longestStreak: newLongest } : prev
    );
  }, [currentUser]);

  const loadDailyLog = useCallback(async (date: string): Promise<DailyLogEntry | null> => {
    if (!currentUser) return null;
    const snap = await getDoc(doc(db, "users", currentUser.id, "dailyLogs", date));
    if (!snap.exists()) return null;
    return snap.data() as DailyLogEntry;
  }, [currentUser]);

  // --- Disclaimer ---
  const acknowledgeDisclaimer = async () => {
    if (!currentUser) return;
    const timestamp = new Date().toISOString();
    await updateDoc(doc(db, "users", currentUser.id), { disclaimerAcknowledgedAt: timestamp });
    setCurrentUser((prev) => prev ? { ...prev, disclaimerAcknowledgedAt: timestamp } : prev);
  };

  return (
    <AppContext.Provider
      value={{
        loading,
        theme,
        setTheme,
        font,
        setFont,
        currentUser,
        login,
        signUp,
        logout,
        allUsers,
        challenges: challengesWithDaysLeft,
        addChallenge,
        logProgress,
        finances,
        setFinances,
        getThreshold,
        setThreshold,
        getCheckInLogs,
        addCheckInLog,
        acknowledgeDisclaimer,
        onboardingData,
        completeOnboarding,
        saveDailyLog,
        loadDailyLog,
        notifications,
        requestTransfer,
        respondToTransfer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
