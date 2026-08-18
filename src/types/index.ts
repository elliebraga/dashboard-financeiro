export type TransactionType = 'income' | 'expense';

export interface User {
  id: string;
  username: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType | 'both';
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  category?: Category;
  date: string;
  description: string | null;
  is_paid: boolean; // pago (true) ou pendente / não pago (false)
  created_at?: string;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
