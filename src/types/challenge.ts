export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  saved: number;
  goal: number;
  daysLeft: number;
  totalDays: number;
  investTo: string;
  category: "recommended" | "trending" | "purchase";
  logs: ProgressLog[];
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
