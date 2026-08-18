import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { BigNumberCards } from './components/BigNumberCards';
import { TransactionForm } from './components/TransactionForm';
import { TransactionTable } from './components/TransactionTable';
import { NewCategoryModal } from './components/NewCategoryModal';
import { ConnectionModal } from './components/ConnectionModal';
import { FinancialSummary } from './components/FinancialSummary';
import { MonthlyComparator } from './components/MonthlyComparator';
import { LoginModal } from './components/LoginModal';
import {
  fetchCategoriesApi,
  fetchTransactionsApi,
  createCategoryApi,
  createTransactionApi,
  updateTransactionPaidStatusApi,
  deleteTransactionApi,
  getStoredUserSession,
  logoutUserSession,
  supabaseClient,
} from './lib/supabase';
import { Category, Transaction, TransactionType, User } from './types';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUserSession());
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
      const [cats, txs] = await Promise.all([
        fetchCategoriesApi(),
        fetchTransactionsApi(),
      ]);
      setCategories(cats);
      setTransactions(txs);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Supabase Realtime Listener
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
      .subscribe();

    return () => {
      if (supabaseClient) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [loadData, currentUser]);

  const handleAddTransaction = async (
    data: Omit<Transaction, 'id' | 'created_at'>
  ) => {
    const newTx = await createTransactionApi(data);
    setTransactions((prev) => [newTx, ...prev]);
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

      {/* Main Content Dashboard (só acessível quando logado) */}
      {currentUser && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
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
