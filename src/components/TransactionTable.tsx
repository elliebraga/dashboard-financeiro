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

  // Estado para o Modal de Confirmação de Exclusão (Substitui caixa de diálogo nativa)
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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Header & Filtros */}
      <div className="p-4 sm:p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
              Histórico de Movimentações
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {filtered.length} {filtered.length === 1 ? 'transação encontrada' : 'transações encontradas'}
            </p>
          </div>

          {/* Filtro por tipo */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all text-center ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all text-center ${
                filterType === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all text-center ${
                filterType === 'expense'
                  ? 'bg-white text-rose-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Despesas
            </button>
          </div>
        </div>

        {/* Campo de Busca & Filtro de Categoria */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-base transition-colors outline-none font-medium min-h-[44px]"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-base transition-colors outline-none font-medium appearance-none min-h-[44px]"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MOBILE: Lista de Cards Responsivos (< md) */}
      <div className="block md:hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-slate-600">Nenhuma transação encontrada</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isIncome = tx.type === 'income';
            const isFuture = new Date(tx.date + 'T00:00:00').getTime() > new Date().setHours(0,0,0,0);

            return (
              <div key={tx.id} className="p-4 space-y-2.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`p-1.5 rounded-xl border ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      {formatDate(tx.date)}
                      {isFuture && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-bold">
                          Agendado
                        </span>
                      )}
                    </span>
                  </div>

                  <span className={`text-base font-extrabold ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isIncome ? '+ ' : '- '}
                    {formatCurrency(Number(tx.amount))}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {tx.description || <span className="text-slate-400 font-normal italic">Sem descrição</span>}
                    </p>
                    {tx.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 mt-1">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        {tx.category.name}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setDeleteConfirmTxId(tx.id)}
                    disabled={deletingId === tx.id}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
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
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-6">Tipo</th>
              <th className="py-3.5 px-6">Data</th>
              <th className="py-3.5 px-6">Descrição</th>
              <th className="py-3.5 px-6">Categoria</th>
              <th className="py-3.5 px-6 text-right">Valor</th>
              <th className="py-3.5 px-6 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-sm text-slate-600">Nenhuma transação encontrada</p>
                    <p className="text-xs text-slate-400">Adicione uma nova movimentação no formulário acima</p>
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
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Tipo com Ícone Visual */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-1.5 rounded-xl border ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-rose-50 text-rose-600 border-rose-200'
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
                            isIncome ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isIncome ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                    </td>

                    {/* Data */}
                    <td className="py-4 px-6 whitespace-nowrap font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span>{formatDate(tx.date)}</span>
                        {isFuture && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-semibold">
                            Agendado
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Descrição */}
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-800">
                        {tx.description || <span className="text-slate-400 font-normal italic">Sem descrição</span>}
                      </span>
                    </td>

                    {/* Categoria */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {tx.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <Tag className="w-3 h-3 text-emerald-600" />
                          {tx.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Sem categoria</span>
                      )}
                    </td>

                    {/* Valor */}
                    <td className="py-4 px-6 whitespace-nowrap text-right font-extrabold text-sm">
                      <span className={isIncome ? 'text-emerald-700' : 'text-rose-700'}>
                        {isIncome ? '+ ' : '- '}
                        {formatCurrency(Number(tx.amount))}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <button
                        onClick={() => setDeleteConfirmTxId(tx.id)}
                        disabled={deletingId === tx.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* Modal Personalizado de Confirmação de Exclusão (Substitui o window.confirm) */}
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
