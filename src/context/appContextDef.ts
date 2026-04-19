import { createContext } from "react";
import type { Challenge, UserFinances } from "../types/challenge";
import type { AppUser, UserRole, CheckInThreshold, CheckInLog } from "../types/user";
import type { FontChoice } from "../types/fonts";

export type Theme = "dark" | "light" | "sepia";

export interface SignUpInput {
  name: string;
  email: string;
  role: UserRole;
}

export interface AppContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  font: FontChoice;
  setFont: (f: FontChoice) => void;
  currentUser: AppUser | null;
  login: (email: string) => { ok: true; user: AppUser } | { ok: false; error: string };
  signUp: (input: SignUpInput) => { ok: true; user: AppUser } | { ok: false; error: string };
  logout: () => void;
  allUsers: AppUser[];
  challenges: Challenge[];
  addChallenge: (c: Challenge) => void;
  logProgress: (challengeId: string, amount: number, note?: string) => void;
  finances: UserFinances;
  setFinances: (f: UserFinances) => void;
  getThreshold: (userId: string) => CheckInThreshold;
  setThreshold: (userId: string, t: CheckInThreshold) => void;
  getCheckInLogs: (userId: string) => CheckInLog[];
  addCheckInLog: (userId: string, note: string) => void;
}

export const AppContext = createContext<AppContextType | null>(null);
