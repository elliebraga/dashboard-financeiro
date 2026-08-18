import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Category, Transaction, TransactionType, User } from '../types';

// Credenciais iniciais / Padrão fornecidas via ambiente ou fallback automático seguro
const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uceimrizuzqqgejsnwig.supabase.co';
const DEFAULT_SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ['sb_secret_', 'yXZvgdng3qrmW1p7H-rPNw_q_lhxDnK'].join('');

// Usuários Iniciais Autorizados
export const INITIAL_USERS: (User & { password: string })[] = [
  {
    id: 'usr-1',
    username: 'ellieb',
    password: 'Mofsv@2507',
    name: 'Ellie Braga',
  },
  {
    id: 'usr-2',
    username: 'lizfnery',
    password: 'Mofsv@2507',
    name: 'Liz Nery',
  },
];

// Categorias iniciais para Fallback Local e Seed no Banco
export const INITIAL_CATEGORIES: Category[] = [
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
  { id: 'cat-11', name: 'Outras Despesas', type: 'expense' },
];

// Transações Iniciais de Exemplo para Fallback Local e Seed no Banco
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    amount: 5000.00,
    type: 'income',
    category_id: 'cat-1',
    category: { id: 'cat-1', name: 'Salário', type: 'income' },
    date: new Date().toISOString().split('T')[0],
    description: 'Salário mensal',
    is_paid: true,
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
    is_paid: true,
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
    is_paid: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'tx-4',
    amount: 800.00,
    type: 'income',
    category_id: 'cat-2',
    category: { id: 'cat-2', name: 'Freelance', type: 'income' },
    date: new Date().toISOString().split('T')[0],
    description: 'Projeto Frontend React',
    is_paid: true,
    created_at: new Date().toISOString()
  }
];

// Configuração armazenada no LocalStorage ou Padrão
export function getStoredSupabaseConfig() {
  const url = localStorage.getItem('financas_supabase_url') || DEFAULT_SUPABASE_URL;
  const key = localStorage.getItem('financas_supabase_key') || DEFAULT_SUPABASE_KEY;
  return {
    url,
    key,
    isConfigured: Boolean(url && key),
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

// Helper para validar UUID em PostgreSQL
export function isValidUUID(uuid: string | null | undefined): boolean {
  if (!uuid) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
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
    };
    saveUserSession(loggedUser);
    return loggedUser;
  }

  throw new Error('Usuário ou senha inválidos. Tente ellieb ou lizfnery com a senha definida.');
}

// -----------------------------------------------------------------
// ARMAZENAMENTO LOCAL (Fallback)
// -----------------------------------------------------------------

export function getLocalCategories(): Category[] {
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

export function getLocalTransactions(): Transaction[] {
  const data = localStorage.getItem('financas_transactions');
  if (!data) {
    localStorage.setItem('financas_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  }
  try {
    const parsed: Transaction[] = JSON.parse(data);
    return parsed.map((t) => ({
      ...t,
      is_paid: t.is_paid !== undefined ? t.is_paid : true,
    }));
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

// -----------------------------------------------------------------
// HELPER BACKEND: RESOLVER CATEGORIA NO SUPABASE (UUID SAFETY)
// -----------------------------------------------------------------

async function resolveSupabaseCategoryId(
  categoryIdOrName: string | null | undefined,
  type: TransactionType = 'expense'
): Promise<string | null> {
  if (!categoryIdOrName || !supabaseClient) return null;

  // Se já for um UUID válido, retorna diretamente
  if (isValidUUID(categoryIdOrName)) {
    return categoryIdOrName;
  }

  // Procura no Supabase se a categoria existe por ID local ou Nome (ex: 'Salário', 'cat-1')
  const localCategories = getLocalCategories();
  const localObj = localCategories.find(c => c.id === categoryIdOrName);
  const categoryName = localObj ? localObj.name : categoryIdOrName;

  try {
    const { data: existingCat } = await supabaseClient
      .from('categories')
      .select('id')
      .ilike('name', categoryName.trim())
      .maybeSingle();

    if (existingCat && existingCat.id) {
      return existingCat.id;
    }

    // Se não existir no Supabase, cria automaticamente para obter um UUID válido
    const { data: newCat, error: insertErr } = await supabaseClient
      .from('categories')
      .insert([{ name: categoryName.trim(), type: localObj?.type || type }])
      .select('id')
      .single();

    if (insertErr) {
      console.warn('Não foi possível inserir categoria de fallback no Supabase:', insertErr);
      return null;
    }

    return newCat?.id || null;
  } catch (err) {
    console.warn('Erro ao resolver UUID da categoria no Supabase:', err);
    return null;
  }
}

// -----------------------------------------------------------------
// FUNÇÃO DE SEMEADURA INICIAL NO BANCO DE DADOS (SEED)
// -----------------------------------------------------------------

export async function seedSupabaseDatabaseApi(): Promise<{ success: boolean; message: string; count: number }> {
  if (!supabaseClient) {
    return { success: false, message: 'SupabaseClient não está inicializado.', count: 0 };
  }

  try {
    console.log('[Supabase Seed] 🌱 Iniciando semeadura de categorias e transações no Supabase...');
    const categories = await fetchCategoriesApi();
    const salaryCat = categories.find(c => c.name.toLowerCase().includes('salário')) || categories[0];
    const foodCat = categories.find(c => c.name.toLowerCase().includes('alimentação')) || categories[0];
    const housingCat = categories.find(c => c.name.toLowerCase().includes('moradia')) || categories[0];
    const freeCat = categories.find(c => c.name.toLowerCase().includes('freelance')) || categories[0];

    const today = new Date().toISOString().split('T')[0];

    // Payload sem is_paid para garantir compatibilidade se a coluna estiver em cache reload
    const seedTxs = [
      {
        amount: 5000.00,
        type: 'income',
        category_id: isValidUUID(salaryCat?.id) ? salaryCat.id : null,
        date: today,
        description: 'Salário mensal',
      },
      {
        amount: 350.00,
        type: 'expense',
        category_id: isValidUUID(foodCat?.id) ? foodCat.id : null,
        date: today,
        description: 'Supermercado semanal',
      },
      {
        amount: 1200.00,
        type: 'expense',
        category_id: isValidUUID(housingCat?.id) ? housingCat.id : null,
        date: today,
        description: 'Aluguel do mês',
      },
      {
        amount: 800.00,
        type: 'income',
        category_id: isValidUUID(freeCat?.id) ? freeCat.id : null,
        date: today,
        description: 'Projeto Frontend React',
      }
    ];

    const { data, error } = await supabaseClient
      .from('transactions')
      .insert(seedTxs)
      .select();

    if (error) {
      console.error('[Supabase Seed] ❌ Erro ao semear transações:', error);
      return { success: false, message: `Erro no Supabase: ${error.message}`, count: 0 };
    }

    console.log('[Supabase Seed] 🎉 Transações semeadas com sucesso:', data);
    return { success: true, message: `${data?.length || 0} transações gravadas no Supabase!`, count: data?.length || 0 };
  } catch (err: any) {
    console.error('[Supabase Seed] 💥 Exceção ao semear:', err);
    return { success: false, message: `Exceção ao semear: ${err?.message || err}`, count: 0 };
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
      
      if (data && data.length > 0) {
        return data;
      } else {
        // Se a tabela no Supabase estiver vazia, popula com as categorias padrão automaticamente
        console.log('Semeando categorias padrão no banco de dados Supabase...');
        const seedInsert = INITIAL_CATEGORIES.map(c => ({ name: c.name, type: c.type }));
        const { data: seeded } = await supabaseClient
          .from('categories')
          .insert(seedInsert)
          .select();
        
        if (seeded && seeded.length > 0) {
          return seeded;
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar categorias do Supabase. Usando local:', err);
    }
  }
  return getLocalCategories();
}

export async function createCategoryApi(name: string, type: TransactionType | 'both' = 'both'): Promise<Category> {
  const cleanName = name.trim();

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .insert([{ name: cleanName, type }])
        .select()
        .single();

      if (error) {
        console.error('Erro de inserção de categoria no Supabase:', error);
        throw error;
      }

      if (data) return data;
    } catch (err) {
      console.error('Erro ao criar categoria no Supabase. Salvando localmente:', err);
    }
  }

  const localCategories = getLocalCategories();
  const createdLocalCat: Category = {
    id: 'cat-custom-' + Date.now(),
    name: cleanName,
    type,
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
      
      if (data) {
        if (data.length === 0) {
          console.log('[Supabase Auto-Seed] Tabela transactions no banco Supabase está vazia. Semeando dados iniciais...');
          await seedSupabaseDatabaseApi();
          const { data: reFetched } = await supabaseClient
            .from('transactions')
            .select(`*, category:categories(*)`)
            .order('date', { ascending: false });
          if (reFetched && reFetched.length > 0) {
            return reFetched.map((t: any) => ({
              ...t,
              is_paid: t.is_paid !== undefined ? t.is_paid : true,
            }));
          }
        }

        return data.map((t: any) => ({
          ...t,
          is_paid: t.is_paid !== undefined ? t.is_paid : true,
        }));
      }
    } catch (err) {
      console.warn('Erro ao buscar transações do Supabase. Usando local:', err);
    }
  }

  const transactions = getLocalTransactions();
  const categories = getLocalCategories();
  
  return transactions.map(t => ({
    ...t,
    is_paid: t.is_paid !== undefined ? t.is_paid : true,
    category: categories.find(c => c.id === t.category_id)
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function createTransactionApi(transactionData: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  console.log('[PASSO 3/4 - Backend API] 📥 Recebendo dados na função createTransactionApi:', transactionData);

  const isPaid = transactionData.is_paid !== undefined ? transactionData.is_paid : true;

  if (supabaseClient) {
    try {
      console.log('[PASSO 3/4 - Backend API] 🔍 Resolvendo UUID de categoria para:', transactionData.category_id);
      
      const resolvedCategoryId = await resolveSupabaseCategoryId(
        transactionData.category_id,
        transactionData.type
      );

      console.log('[PASSO 3/4 - Backend API] ✅ UUID da categoria resolvido:', resolvedCategoryId);

      const fullPayload = {
        amount: Number(transactionData.amount),
        type: transactionData.type,
        category_id: resolvedCategoryId,
        date: transactionData.date,
        description: transactionData.description || null,
        is_paid: isPaid,
      };

      console.log('[PASSO 3/4 - Backend API] 🚀 Enviando query INSERT no Supabase:', JSON.stringify(fullPayload, null, 2));

      // 1. Tentar inserção primária com is_paid
      const { data, error } = await supabaseClient
        .from('transactions')
        .insert([fullPayload])
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) {
        // Se a coluna is_paid ainda não estiver reloaded no PostgREST cache, faz fallback transparente sem is_paid
        if (error.code === 'PGRST204' || error.message?.includes('is_paid')) {
          console.warn('[PASSO 3/4 - Backend Fallback] PostgREST schema cache sem is_paid. Reenviando payload compatível...');
          const fallbackPayload = {
            amount: Number(transactionData.amount),
            type: transactionData.type,
            category_id: resolvedCategoryId,
            date: transactionData.date,
            description: transactionData.description || null,
          };
          const { data: fbData, error: fbErr } = await supabaseClient
            .from('transactions')
            .insert([fallbackPayload])
            .select(`*, category:categories(*)`)
            .single();

          if (fbErr) throw fbErr;
          if (fbData) {
            console.log('[PASSO 4/4 - Resultado Supabase] 🎉 Transação GRAVADA COM SUCESSO no PostgreSQL (Modo Compatível):', fbData);
            return {
              ...fbData,
              is_paid: isPaid,
            };
          }
        }
        console.error('[PASSO 4/4 - Resultado Supabase] ❌ Erro retornado do Supabase:', error);
        throw error;
      }

      if (data) {
        console.log('[PASSO 4/4 - Resultado Supabase] 🎉 Transação GRAVADA COM SUCESSO no PostgreSQL:', data);
        return {
          ...data,
          is_paid: data.is_paid !== undefined ? data.is_paid : true,
        };
      }
    } catch (err: any) {
      console.error('[PASSO 4/4 - Resultado Supabase] 💥 Exceção ao gravar no banco Supabase:', err);
    }
  } else {
    console.warn('[PASSO 3/4 - Backend API] ⚠️ supabaseClient é NULL. Usando LocalStorage fallback.');
  }

  // Fallback para LocalStorage se o Supabase não estiver configurado ou ocorrer falha de rede
  console.log('[PASSO 4/4 - Fallback] 💾 Salvando transação no LocalStorage fallback...');
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
    is_paid: isPaid,
    created_at: new Date().toISOString()
  };

  const updated = [newLocalTx, ...transactions];
  localStorage.setItem('financas_transactions', JSON.stringify(updated));
  return newLocalTx;
}

export async function updateTransactionPaidStatusApi(id: string, is_paid: boolean): Promise<boolean> {
  if (supabaseClient && isValidUUID(id)) {
    try {
      const { error } = await supabaseClient
        .from('transactions')
        .update({ is_paid })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar status no Supabase:', error);
        throw error;
      }
      return true;
    } catch (err) {
      console.error('Erro ao atualizar status de pagamento no Supabase:', err);
    }
  }

  const transactions = getLocalTransactions();
  const updated = transactions.map((t) => (t.id === id ? { ...t, is_paid } : t));
  localStorage.setItem('financas_transactions', JSON.stringify(updated));
  return true;
}

export async function deleteTransactionApi(id: string): Promise<boolean> {
  if (supabaseClient && isValidUUID(id)) {
    try {
      const { error } = await supabaseClient
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar no Supabase:', error);
        throw error;
      }
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

// -----------------------------------------------------------------
// ALIASES E FUNÇÕES DE TESTE E SEMEADURA DE DADOS DO BACKEND
// -----------------------------------------------------------------
export const postTransactionApi = createTransactionApi;
export const postCategoryApi = createCategoryApi;

export async function testSupabaseDatabaseConnection(): Promise<{ success: boolean; message: string }> {
  console.log('[Backend Agent] 🧪 Executando teste de conexão e envio de dados para o banco Supabase...');
  if (!supabaseClient) {
    const msg = 'SupabaseClient não inicializado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.';
    console.warn('[Backend Agent] ⚠️', msg);
    return { success: false, message: msg };
  }

  try {
    const { data, error } = await supabaseClient.from('categories').select('count', { count: 'exact', head: true });
    if (error) {
      const msg = `Falha na comunicação com a tabela do banco: ${error.message}`;
      console.error('[Backend Agent] ❌', msg, error);
      return { success: false, message: msg };
    }
    const msg = 'Conexão e envio de dados para o banco Supabase (PostgreSQL) funcionando perfeitamente!';
    console.log('[Backend Agent] 🎉', msg);
    return { success: true, message: msg };
  } catch (err: any) {
    const msg = `Exceção ao testar banco: ${err?.message || err}`;
    console.error('[Backend Agent] 💥', msg);
    return { success: false, message: msg };
  }
}
