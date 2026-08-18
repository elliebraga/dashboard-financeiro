import React, { useState, useEffect, useCallback } from 'react';
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
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'current_month'>('current_month');

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      {/* Ambient background blur glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Bar */}
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
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
          {/* Top: Big Numbers (Saldo Total, Receitas, Despesas, Projeções 15 e 30) */}
          <BigNumberCards
            transactions={transactions}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />

          {/* Comparativo Mensal de Valores (Exibido na Aba "Tudo" / Todo o Período) */}
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
              <FinancialSummary transactions={transactions} />
            </div>
          </div>

          {/* Bottom: Transaction Table */}
          <TransactionTable
            transactions={transactions}
            categories={categories}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 font-medium mt-auto relative z-10">
        <p>© 2026 Dashboard de Finanças Pessoais — Acesso Restrito para Ellie & Liz</p>
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
