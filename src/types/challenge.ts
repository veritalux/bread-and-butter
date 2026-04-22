export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  saved: number;
  goal: number;
  startDate: string;
  totalDays: number;
  daysLeft?: number;
  investTo: string;
  category: "recommended" | "trending" | "purchase";
  logs: ProgressLog[];
}

export function computeDaysLeft(startDate: string, totalDays: number): number {
  const start = new Date(startDate);
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, totalDays - elapsed);
}

export interface ProgressLog {
  date: string;
  aligned: boolean;
  amount: number;
  note?: string;
}

export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "recommended" | "trending" | "purchase";
  tag?: string;
  savingsEstimate: string;
  duration: string;
  defaultGoal: number;
  defaultDays: number;
  guidelines: string[];
}

export interface UserFinances {
  weeklyIncome: number;
  taxRate: number;
  weeklyInvestment: number;
}
