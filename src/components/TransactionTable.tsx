import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Filter, Trash2, Calendar, Tag, AlertCircle } from 'lucide-react';
import { Transaction, Category } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  onDeleteTransaction: (id: string) => Promise<void>;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  categories,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [deleteConfirmTxId, setDeleteConfirmTxId] = useState<string | null>(null);

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const filtered = sortedTransactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesCategory = filterCategory === 'all' || tx.category_id === filterCategory;

    const desc = (tx.description || '').toLowerCase();
    const catName = (tx.category?.name || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = !searchTerm || desc.includes(query) || catName.includes(query);

    return matchesType && matchesCategory && matchesSearch;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTxId) return;
    const id = deleteConfirmTxId;
    setDeletingId(id);
    try {
      await onDeleteTransaction(id);
    } finally {
      setDeletingId(null);
      setDeleteConfirmTxId(null);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
      {/* Header & Filtros */}
      <div className="p-4 sm:p-6 border-b border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
              Histórico de Movimentações
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {filtered.length} {filtered.length === 1 ? 'transação encontrada' : 'transações encontradas'}
            </p>
          </div>

          {/* Filtro por tipo */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all text-center ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all text-center ${
                filterType === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all text-center ${
                filterType === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Despesas
            </button>
          </div>
        </div>

        {/* Campo de Busca & Filtro de Categoria */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 focus:bg-slate-950 text-white rounded-xl pl-10 pr-4 py-2.5 text-base transition-colors outline-none font-medium min-h-[44px]"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 focus:bg-slate-950 text-white rounded-xl pl-10 pr-4 py-2.5 text-base transition-colors outline-none font-medium appearance-none min-h-[44px]"
            >
              <option value="" className="bg-slate-900 text-slate-400">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MOBILE: Lista de Cards Responsivos (< md) */}
      <div className="block md:hidden divide-y divide-slate-800/60">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-sm text-slate-300">Nenhuma transação encontrada</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isIncome = tx.type === 'income';
            const isFuture = new Date(tx.date + 'T00:00:00').getTime() > new Date().setHours(0,0,0,0);

            return (
              <div key={tx.id} className="p-4 space-y-2.5 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`p-1.5 rounded-xl border ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      {formatDate(tx.date)}
                      {isFuture && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-bold">
                          Agendado
                        </span>
                      )}
                    </span>
                  </div>

                  <span className={`text-base font-extrabold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isIncome ? '+ ' : '- '}
                    {formatCurrency(Number(tx.amount))}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-sm font-bold text-slate-100">
                      {tx.description || <span className="text-slate-500 font-normal italic">Sem descrição</span>}
                    </p>
                    {tx.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 mt-1">
                        <Tag className="w-3 h-3 text-emerald-400" />
                        {tx.category.name}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setDeleteConfirmTxId(tx.id)}
                    disabled={deletingId === tx.id}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                    title="Excluir Transação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* VIEW DESKTOP: Tabela Tradicional (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-6">Tipo</th>
              <th className="py-3.5 px-6">Data</th>
              <th className="py-3.5 px-6">Descrição</th>
              <th className="py-3.5 px-6">Categoria</th>
              <th className="py-3.5 px-6 text-right">Valor</th>
              <th className="py-3.5 px-6 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-600" />
                    <p className="font-semibold text-sm text-slate-300">Nenhuma transação encontrada</p>
                    <p className="text-xs text-slate-500">Adicione uma nova movimentação no formulário acima</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isIncome = tx.type === 'income';
                const isFuture = new Date(tx.date + 'T00:00:00').getTime() > new Date().setHours(0,0,0,0);

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Tipo com Ícone Visual */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-1.5 rounded-xl border ${
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>
                        <span
                          className={`font-bold ${
                            isIncome ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isIncome ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                    </td>

                    {/* Data */}
                    <td className="py-4 px-6 whitespace-nowrap font-semibold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span>{formatDate(tx.date)}</span>
                        {isFuture && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-semibold">
                            Agendado
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Descrição */}
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-100">
                        {tx.description || <span className="text-slate-500 font-normal italic">Sem descrição</span>}
                      </span>
                    </td>

                    {/* Categoria */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {tx.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          <Tag className="w-3 h-3 text-emerald-400" />
                          {tx.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Sem categoria</span>
                      )}
                    </td>

                    {/* Valor */}
                    <td className="py-4 px-6 whitespace-nowrap text-right font-extrabold text-sm">
                      <span className={isIncome ? 'text-emerald-400' : 'text-rose-400'}>
                        {isIncome ? '+ ' : '- '}
                        {formatCurrency(Number(tx.amount))}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <button
                        onClick={() => setDeleteConfirmTxId(tx.id)}
                        disabled={deletingId === tx.id}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Excluir Transação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Personalizado de Confirmação em Glassmorphism */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmTxId)}
        title="Excluir Transação"
        message="Tem certeza que deseja excluir esta movimentação financeira? Esta ação removerá a transação permanentemente."
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirmTxId(null)}
      />
    </div>
  );
};
