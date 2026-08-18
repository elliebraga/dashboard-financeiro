export type TransactionType = 'income' | 'expense';

export interface User {
  id: string;
  username: string;
  name: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType | 'both';
  created_at?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category_id?: string | null;
  category?: Category;
  date: string; // YYYY-MM-DD
  description?: string | null;
  created_at?: string;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
}

export interface SupabaseConfig {
  url: string;
  key: string;
}
