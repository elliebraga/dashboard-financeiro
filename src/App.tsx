import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { BigNumberCards } from './components/BigNumberCards';
import { TransactionForm } from './components/TransactionForm';
import { TransactionTable } from './components/TransactionTable';
import { NewCategoryModal } from './components/NewCategoryModal';
import { ConnectionModal } from './components/ConnectionModal';
import { FinancialSummary } from './components/FinancialSummary';
import { MonthlyComparator } from './components/MonthlyComparator';
import { GroceryShopping } from './components/GroceryShopping';
import { LoginModal } from './components/LoginModal';
import {
  fetchCategoriesApi,
  fetchTransactionsApi,
  createCategoryApi,
  createTransactionApi,
  updateTransactionPaidStatusApi,
  deleteTransactionApi,
  fetchGroceryListsApi,
  createGroceryListApi,
  deleteGroceryListApi,
  addGroceryItemApi,
  updateGroceryItemApi,
  deleteGroceryItemApi,
  getStoredUserSession,
  logoutUserSession,
  supabaseClient,
} from './lib/supabase';
import { Category, Transaction, TransactionType, User, GroceryList, GroceryItem } from './types';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUserSession());
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'grocery'>('dashboard');
  const [loading, setLoading] = useState(true);

  // Mês atual como padrão do dropdown (ex: '2026-08') ou 'all'
  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedPeriod, setSelectedPeriod] = useState<string>(currentYM);

  // Modais
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [categoryModalType, setCategoryModalType] = useState<TransactionType>('expense');

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [cats, txs, glists] = await Promise.all([
        fetchCategoriesApi(),
        fetchTransactionsApi(),
        fetchGroceryListsApi(),
      ]);
      setCategories(cats);
      setTransactions(txs);
      setGroceryLists(glists);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Supabase Realtime Listener (Transactions, Categories, Grocery Lists, Grocery Items)
  useEffect(() => {
    if (!supabaseClient || !currentUser) return;

    const channel = supabaseClient
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          loadData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          loadData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'grocery_lists' },
        () => {
          loadData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'grocery_items' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      if (supabaseClient) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [loadData, currentUser]);

  // Handlers Dashboard Financeiro
  const handleAddTransaction = async (
    data: Omit<Transaction, 'id' | 'created_at'>
  ) => {
    console.log('[PASSO 2/4 - App.tsx] 📥 Recebendo payload no App handler:', data);
    try {
      const newTx = await createTransactionApi(data);
      console.log('[PASSO 2/4 - App.tsx] 🎉 Transação criada com sucesso retornado do backend:', newTx);
      setTransactions((prev) => [newTx, ...prev]);
    } catch (err) {
      console.error('[PASSO 2/4 - App.tsx] 💥 Erro ao chamar createTransactionApi no backend:', err);
      throw err;
    }
  };

  const handleCreateCategory = async (
    name: string,
    type: TransactionType | 'both'
  ): Promise<Category> => {
    const newCat = await createCategoryApi(name, type);
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const handleTogglePaidStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    await updateTransactionPaidStatusApi(id, newStatus);
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_paid: newStatus } : t))
    );
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransactionApi(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Handlers Módulo de Mercado
  const handleAddGroceryList = async (title: string, date: string, notes?: string): Promise<GroceryList> => {
    const newList = await createGroceryListApi(title, date, notes);
    setGroceryLists((prev) => [newList, ...prev]);
    return newList;
  };

  const handleDeleteGroceryList = async (listId: string) => {
    await deleteGroceryListApi(listId);
    setGroceryLists((prev) => prev.filter((l) => l.id !== listId));
  };

  const handleAddGroceryItem = async (
    listId: string,
    item: { name: string; quantity: number; unit_price: number; category: string }
  ) => {
    const newItem = await addGroceryItemApi(listId, item);
    setGroceryLists((prev) =>
      prev.map((l) => {
        if (l.id === listId) {
          const items = [...(l.items || []), newItem];
          const total_amount = items.reduce((acc, i) => acc + (i.total_price || 0), 0);
          return { ...l, items, total_amount };
        }
        return l;
      })
    );
  };

  const handleToggleGroceryItemPurchased = async (itemId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    await updateGroceryItemApi(itemId, { is_purchased: newStatus });
    setGroceryLists((prev) =>
      prev.map((l) => {
        const items = (l.items || []).map((i) =>
          i.id === itemId ? { ...i, is_purchased: newStatus } : i
        );
        return { ...l, items };
      })
    );
  };

  const handleDeleteGroceryItem = async (itemId: string, listId: string) => {
    await deleteGroceryItemApi(itemId, listId);
    setGroceryLists((prev) =>
      prev.map((l) => {
        if (l.id === listId) {
          const items = (l.items || []).filter((i) => i.id !== itemId);
          const total_amount = items.reduce((acc, i) => acc + (i.total_price || 0), 0);
          return { ...l, items, total_amount };
        }
        return l;
      })
    );
  };

  const handleUpdateGroceryItem = async (itemId: string, updates: Partial<GroceryItem>) => {
    await updateGroceryItemApi(itemId, updates);
    setGroceryLists((prev) =>
      prev.map((l) => {
        const items = (l.items || []).map((i) => {
          if (i.id === itemId) {
            const qty = updates.quantity !== undefined ? updates.quantity : i.quantity;
            const price = updates.unit_price !== undefined ? updates.unit_price : i.unit_price;
            const totalPrice = qty * price;
            return { ...i, ...updates, total_price: totalPrice };
          }
          return i;
        });
        const total_amount = items.reduce((acc, i) => acc + (i.total_price || 0), 0);
        return { ...l, items, total_amount };
      })
    );
  };

  const handleOpenCategoryModal = (type: TransactionType) => {
    setCategoryModalType(type);
    setIsNewCategoryModalOpen(true);
  };

  const handleLogout = () => {
    logoutUserSession();
    setCurrentUser(null);
  };

  // Filtragem das transações exibidas nos gráficos e resumos com base no mês selecionado
  const displayedTransactions = useMemo(() => {
    if (selectedPeriod === 'all') return transactions;
    return transactions.filter((t) => t.date && t.date.startsWith(selectedPeriod));
  }, [transactions, selectedPeriod]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-slate-50 to-teal-50/40 text-slate-800 flex flex-col font-sans selection:bg-pink-100 selection:text-pink-900 relative overflow-hidden">
      {/* Background com Círculos Desfocados Pastéis (Aesthetic Fofo) */}
      <div className="w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-3xl absolute -top-20 -left-20 pointer-events-none animate-pulse duration-1000"></div>
      <div className="w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-3xl absolute top-1/3 -right-20 pointer-events-none"></div>
      <div className="w-[450px] h-[450px] bg-sky-200/40 rounded-full blur-3xl absolute bottom-10 left-1/3 pointer-events-none"></div>
      <div className="w-[350px] h-[350px] bg-amber-200/30 rounded-full blur-3xl absolute top-2/3 left-10 pointer-events-none"></div>

      {/* Header Bar Flutuante e Suave */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenConnectionModal={() => setIsConnectionModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Se não estiver autenticado, exibe o LoginModal */}
      <LoginModal
        isOpen={!currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Main Content (Dashboard ou Mercado) */}
      {currentUser && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
          
          {/* ABA 1: DASHBOARD FINANCEIRO */}
          {activeTab === 'dashboard' && (
            <>
              {/* Top: Big Numbers com Dropdown de Seleção por Mês */}
              <BigNumberCards
                transactions={transactions}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
              />

              {/* Comparativo Mensal de Valores (Exibido quando selecionar "Todo o Período") */}
              {selectedPeriod === 'all' && (
                <MonthlyComparator
                  transactions={transactions}
                  categories={categories}
                />
              )}

              {/* Middle Grid: Transaction Form + Financial Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="lg:col-span-2">
                  <TransactionForm
                    categories={categories}
                    onAddTransaction={handleAddTransaction}
                    onOpenNewCategoryModal={handleOpenCategoryModal}
                  />
                </div>

                <div className="lg:col-span-1">
                  <FinancialSummary transactions={displayedTransactions} />
                </div>
              </div>

              {/* Bottom: Transaction Table */}
              <TransactionTable
                transactions={displayedTransactions}
                categories={categories}
                onDeleteTransaction={handleDeleteTransaction}
                onTogglePaidStatus={handleTogglePaidStatus}
              />
            </>
          )}

          {/* ABA 2: COMPRAS DE MERCADO */}
          {activeTab === 'grocery' && (
            <GroceryShopping
              groceryLists={groceryLists}
              onAddList={handleAddGroceryList}
              onDeleteList={handleDeleteGroceryList}
              onAddItem={handleAddGroceryItem}
              onUpdateItem={handleUpdateGroceryItem}
              onToggleItemPurchased={handleToggleGroceryItemPurchased}
              onDeleteItem={handleDeleteGroceryItem}
            />
          )}

        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/50 backdrop-blur-xs py-6 text-center text-xs text-slate-500 font-bold mt-auto relative z-10">
        <p>© 2026 Dindin • Feito com carinho para Ellie & Liz 💕</p>
      </footer>

      {/* Modais Adicionais */}
      <ConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        onConfigSaved={loadData}
      />

      <NewCategoryModal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        onCategoryCreated={(newCat) => {
          setCategories((prev) => [...prev, newCat]);
        }}
        initialType={categoryModalType}
        createCategoryFn={handleCreateCategory}
      />
    </div>
  );
}
