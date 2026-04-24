export interface OnboardingData {
  cashOnHand: number;
  monthlyFixedPayments: number;
  debtAmount: number;
  monthlyIncome: number;
  taxRate: number;
  weeklyInvestment: number;
  goals: string[];
}

export const GOAL_OPTIONS = [
  { id: "building-saving-habits", label: "Building Saving Habits" },
  { id: "emergency-fund", label: "Making an Emergency Fund" },
  { id: "getting-out-of-debt", label: "Getting Out of Debt" },
  { id: "future-goals-big-expenses", label: "Future Goals / Big Expenses" },
  { id: "saving-for-retirement", label: "Saving for Retirement" },
  { id: "financial-independence", label: "Financial Independence" },
] as const;
