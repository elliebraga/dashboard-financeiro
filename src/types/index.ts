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

// -----------------------------------------------------------------
// TIPOS DO MÓDULO DE COMPRAS DE MERCADO
// -----------------------------------------------------------------

export type GroceryCategory =
  | 'Hortifruti'
  | 'Laticínios'
  | 'Carnes & Peixes'
  | 'Padaria'
  | 'Limpeza'
  | 'Higiene'
  | 'Bebidas'
  | 'Mercearia'
  | 'Outros';

export interface GroceryItem {
  id: string;
  list_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number; // quantidade * preço unitário
  is_purchased: boolean;
  category: GroceryCategory | string;
  created_at?: string;
}

export interface GroceryList {
  id: string;
  title: string;
  date: string;
  total_amount: number;
  notes?: string | null;
  status: 'active' | 'completed' | 'archived';
  items?: GroceryItem[];
  created_at?: string;
}
