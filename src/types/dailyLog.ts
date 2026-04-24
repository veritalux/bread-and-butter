export interface IncomeEntry {
  amount: number;
  source: string;
}

export interface SpendingEntry {
  amount: number;
  category: string;
}

export interface DailyLogEntry {
  date: string;
  income: IncomeEntry[];
  spending: SpendingEntry[];
  createdAt: string;
  updatedAt: string;
}

export const SPENDING_CATEGORIES = [
  { id: "food", label: "Food" },
  { id: "transportation", label: "Transportation" },
  { id: "housing", label: "Housing" },
  { id: "utilities", label: "Utilities" },
  { id: "leisure", label: "Leisure" },
  { id: "healthcare", label: "Healthcare" },
  { id: "clothing", label: "Clothing" },
  { id: "education", label: "Education" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "other", label: "Other" },
] as const;
