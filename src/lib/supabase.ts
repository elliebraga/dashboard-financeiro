import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Category, Transaction, TransactionType, User } from '../types';

const INITIAL_USERS: (User & { password: string })[] = [
  {
    id: 'user-1',
    username: 'ellieb',
    password: 'Mofsv@2507',
    name: 'Ellie Braga',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-2',
    username: 'lizfnery',
    password: 'Mofsv@2507',
    name: 'Liz Nery',
    created_at: new Date().toISOString()
  }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Salário', type: 'income' },
  { id: 'cat-2', name: 'Freelance', type: 'income' },
  { id: 'cat-3', name: 'Investimentos', type: 'income' },
  { id: 'cat-4', name: 'Outras Receitas', type: 'income' },
  { id: 'cat-5', name: 'Alimentação', type: 'expense' },
  { id: 'cat-6', name: 'Moradia', type: 'expense' },
  { id: 'cat-7', name: 'Transporte', type: 'expense' },
  { id: 'cat-8', name: 'Lazer', type: 'expense' },
  { id: 'cat-9', name: 'Saúde', type: 'expense' },
  { id: 'cat-10', name: 'Educação', type: 'expense' },
  { id: 'cat-11', name: 'Contas & Serviços', type: 'expense' },
  { id: 'cat-12', name: 'Outras Despesas', type: 'expense' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    amount: 5500.00,
    type: 'income',
    category_id: 'cat-1',
    category: { id: 'cat-1', name: 'Salário', type: 'income' },
    date: new Date().toISOString().split('T')[0],
    description: 'Salário mensal',
    created_at: new Date().toISOString()
  },
  {
    id: 'tx-2',
    amount: 350.00,
    type: 'expense',
    category_id: 'cat-5',
    category: { id: 'cat-5', name: 'Alimentação', type: 'expense' },
    date: new Date().toISOString().split('T')[0],
    description: 'Supermercado semanal',
    created_at: new Date().toISOString()
  },
  {
    id: 'tx-3',
    amount: 1200.00,
    type: 'expense',
    category_id: 'cat-6',
    category: { id: 'cat-6', name: 'Moradia', type: 'expense' },
    date: new Date().toISOString().split('T')[0],
    description: 'Aluguel do mês',
    created_at: new Date().toISOString()
  },
  {
    id: 'tx-4',
    amount: 800.00,
    type: 'income',
    category_id: 'cat-2',
    category: { id: 'cat-2', name: 'Freelance', type: 'income' },
    date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    description: 'Projeto UI/UX Figma',
    created_at: new Date().toISOString()
  }
];

export function getStoredSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem('financas_supabase_url') || envUrl;
  const storedKey = localStorage.getItem('financas_supabase_key') || envKey;

  const isValid = Boolean(
    storedUrl && 
    storedKey && 
    storedUrl.startsWith('https://') && 
    !storedUrl.includes('seu-projeto.supabase.co') &&
    !storedKey.includes('sua-chave')
  );

  return {
    url: storedUrl,
    key: storedKey,
    isConfigured: isValid
  };
}

export function createSupabaseClientInstance(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (config.isConfigured) {
    try {
      return createClient(config.url, config.key);
    } catch (err) {
      console.error('Erro ao conectar com Supabase:', err);
      return null;
    }
  }
  return null;
}

export let supabaseClient = createSupabaseClientInstance();

export function updateSupabaseConfig(url: string, key: string) {
  if (url && key) {
    localStorage.setItem('financas_supabase_url', url);
    localStorage.setItem('financas_supabase_key', key);
  } else {
    localStorage.removeItem('financas_supabase_url');
    localStorage.removeItem('financas_supabase_key');
  }
  supabaseClient = createSupabaseClientInstance();
}

// -----------------------------------------------------------------
// GERENCIAMENTO DE SESSÃO DO USUÁRIO
// -----------------------------------------------------------------

export function getStoredUserSession(): User | null {
  const data = localStorage.getItem('financas_user_session');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveUserSession(user: User) {
  localStorage.setItem('financas_user_session', JSON.stringify(user));
}

export function logoutUserSession() {
  localStorage.removeItem('financas_user_session');
}

// -----------------------------------------------------------------
// API DE AUTENTICAÇÃO
// -----------------------------------------------------------------

export async function loginUserApi(usernameInput: string, passwordInput: string): Promise<User> {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .ilike('username', cleanUsername)
        .eq('password', cleanPassword)
        .maybeSingle();

      if (error) {
        console.warn('Erro ao autenticar no Supabase:', error);
      } else if (data) {
        const loggedUser: User = {
          id: data.id,
          username: data.username,
          name: data.name,
          created_at: data.created_at
        };
        saveUserSession(loggedUser);
        return loggedUser;
      }
    } catch (err) {
      console.warn('Erro ao consultar tabela users no Supabase:', err);
    }
  }

  // Fallback Local
  const foundLocal = INITIAL_USERS.find(
    u => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword
  );

  if (foundLocal) {
    const loggedUser: User = {
      id: foundLocal.id,
      username: foundLocal.username,
      name: foundLocal.name,
      created_at: foundLocal.created_at
    };
    saveUserSession(loggedUser);
    return loggedUser;
  }

  throw new Error('Usuário ou senha incorretos.');
}

// -----------------------------------------------------------------
// LOCALSTORAGE FALLBACK SERVICE
// -----------------------------------------------------------------

function getLocalCategories(): Category[] {
  const data = localStorage.getItem('financas_categories');
  if (!data) {
    localStorage.setItem('financas_categories', JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_CATEGORIES;
  }
}

function getLocalTransactions(): Transaction[] {
  const data = localStorage.getItem('financas_transactions');
  if (!data) {
    localStorage.setItem('financas_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

// -----------------------------------------------------------------
// API SERVICE (Categories & Transactions)
// -----------------------------------------------------------------

export async function fetchCategoriesApi(): Promise<Category[]> {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) return data;
      return getLocalCategories();
    } catch (err) {
      console.warn('Erro ao carregar categorias do Supabase. Usando local:', err);
    }
  }
  return getLocalCategories();
}

export async function createCategoryApi(name: string, type: TransactionType | 'both' = 'both'): Promise<Category> {
  const newCat = {
    name: name.trim(),
    type
  };

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .insert([newCat])
        .select()
        .single();

      if (error) throw error;
      if (data) return data;
    } catch (err) {
      console.error('Erro ao criar categoria no Supabase:', err);
    }
  }

  const localCategories = getLocalCategories();
  const createdLocalCat: Category = {
    id: 'cat-custom-' + Date.now(),
    name: name.trim(),
    type,
    created_at: new Date().toISOString()
  };
  const updated = [...localCategories, createdLocalCat];
  localStorage.setItem('financas_categories', JSON.stringify(updated));
  return createdLocalCat;
}

export async function fetchTransactionsApi(): Promise<Transaction[]> {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('transactions')
        .select(`
          *,
          category:categories(*)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      if (data) return data;
    } catch (err) {
      console.warn('Erro ao buscar transações do Supabase. Usando local:', err);
    }
  }

  const transactions = getLocalTransactions();
  const categories = getLocalCategories();
  
  return transactions.map(t => ({
    ...t,
    category: categories.find(c => c.id === t.category_id)
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function createTransactionApi(transactionData: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('transactions')
        .insert([{
          amount: Number(transactionData.amount),
          type: transactionData.type,
          category_id: transactionData.category_id || null,
          date: transactionData.date,
          description: transactionData.description || null
        }])
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) throw error;
      if (data) return data;
    } catch (err) {
      console.error('Erro ao criar transação no Supabase:', err);
    }
  }

  const transactions = getLocalTransactions();
  const categories = getLocalCategories();
  const categoryObj = categories.find(c => c.id === transactionData.category_id);

  const newLocalTx: Transaction = {
    id: 'tx-' + Date.now(),
    amount: Number(transactionData.amount),
    type: transactionData.type,
    category_id: transactionData.category_id,
    category: categoryObj,
    date: transactionData.date,
    description: transactionData.description || null,
    created_at: new Date().toISOString()
  };

  const updated = [newLocalTx, ...transactions];
  localStorage.setItem('financas_transactions', JSON.stringify(updated));
  return newLocalTx;
}

export async function deleteTransactionApi(id: string): Promise<boolean> {
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao deletar transação no Supabase:', err);
    }
  }

  const transactions = getLocalTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  localStorage.setItem('financas_transactions', JSON.stringify(filtered));
  return true;
}
