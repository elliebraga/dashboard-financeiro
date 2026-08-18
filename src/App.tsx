import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { BigNumberCards } from './components/BigNumberCards';
import { TransactionForm } from './components/TransactionForm';
import { TransactionTable } from './components/TransactionTable';
import { NewCategoryModal } from './components/NewCategoryModal';
import { ConnectionModal } from './components/ConnectionModal';
import { FinancialSummary } from './components/FinancialSummary';
import {
  fetchCategoriesApi,
  fetchTransactionsApi,
  createCategoryApi,
  createTransactionApi,
  deleteTransactionApi,
  supabaseClient,
} from './lib/supabase';
import { Category, Transaction, TransactionType } from './types';

export function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'current_month'>('current_month');

  // Modais
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [categoryModalType, setCategoryModalType] = useState<TransactionType>('expense');

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Supabase Realtime Listener
  useEffect(() => {
    if (!supabaseClient) return;

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
  }, [loadData]);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header Bar */}
      <Navbar onOpenConnectionModal={() => setIsConnectionModalOpen(true)} />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top: Big Numbers (Saldo Total, Receitas, Despesas) */}
        <BigNumberCards
          transactions={transactions}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />

        {/* Middle Grid: Transaction Form + Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-medium">
        <p>© 2026 Dashboard de Finanças Pessoais — Integrado com Supabase & PostgreSQL</p>
      </footer>

      {/* Modais */}
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
