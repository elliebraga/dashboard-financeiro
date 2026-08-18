import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Filter, Trash2, Calendar, Tag, AlertCircle, CheckSquare, Square, CheckCircle2 } from 'lucide-react';
import { Transaction, Category } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  onDeleteTransaction: (id: string) => Promise<void>;
  onTogglePaidStatus: (id: string, currentStatus: boolean) => Promise<void>;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  categories,
  onDeleteTransaction,
  onTogglePaidStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingPaidId, setTogglingPaidId] = useState<string | null>(null);

  const [deleteConfirmTxId, setDeleteConfirmTxId] = useState<string | null>(null);

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const filtered = sortedTransactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesCategory = filterCategory === 'all' || tx.category_id === filterCategory;

    const isPaid = tx.is_paid !== undefined ? tx.is_paid : true;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'paid' && isPaid) ||
      (filterStatus === 'unpaid' && !isPaid);

    const desc = (tx.description || '').toLowerCase();
    const catName = (tx.category?.name || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = !searchTerm || desc.includes(query) || catName.includes(query);

    return matchesType && matchesCategory && matchesStatus && matchesSearch;
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

  const handleTogglePaid = async (tx: Transaction) => {
    const currentStatus = tx.is_paid !== undefined ? tx.is_paid : true;
    setTogglingPaidId(tx.id);
    try {
      await onTogglePaidStatus(tx.id, currentStatus);
    } finally {
      setTogglingPaidId(null);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
      {/* Header & Filtros */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 space-y-4">
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
          <div className="grid grid-cols-3 gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`py-1.5 px-3 text-xs font-bold rounded-xl transition-all text-center ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`py-1.5 px-3 text-xs font-bold rounded-xl transition-all text-center ${
                filterType === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`py-1.5 px-3 text-xs font-bold rounded-xl transition-all text-center ${
                filterType === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Despesas
            </button>
          </div>
        </div>

        {/* Campo de Busca & Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 rounded-2xl pl-10 pr-4 py-2.5 text-base transition-colors outline-none font-medium min-h-[44px]"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 rounded-2xl pl-10 pr-4 py-2.5 text-base transition-colors outline-none font-medium appearance-none min-h-[44px]"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div className="relative">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-slate-50/80 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 rounded-2xl pl-10 pr-4 py-2.5 text-base transition-colors outline-none font-medium appearance-none min-h-[44px]"
            >
              <option value="all">Status: Todos</option>
              <option value="paid">Status: Apenas Pagos</option>
              <option value="unpaid">Status: Apenas Pendentes</option>
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
            const isPaid = tx.is_paid !== undefined ? tx.is_paid : true;
            const isFuture = new Date(tx.date + 'T00:00:00').getTime() > new Date().setHours(0,0,0,0);

            return (
              <div key={tx.id} className="p-4 space-y-2.5 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`p-1.5 rounded-2xl border ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      {formatDate(tx.date)}
                      {isFuture && (
                        <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-full border border-sky-100 font-bold">
                          Agendado
                        </span>
                      )}
                    </span>
                  </div>

                  <span className={`text-base font-extrabold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 mt-1">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        {tx.category.name}
                      </span>
                    )}
                  </div>

                  {/* Checkbox Interativo de Pago / Não Pago (Mobile) */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTogglePaid(tx)}
                      disabled={togglingPaidId === tx.id}
                      className={`px-2.5 py-1.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs hover:bg-amber-100'
                      }`}
                      title={isPaid ? 'Marcar como Pendente' : 'Marcar como Pago'}
                    >
                      {isPaid ? (
                        <>
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                          <span>Pago</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-4 h-4 text-amber-600" />
                          <span>Pendente</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setDeleteConfirmTxId(tx.id)}
                      disabled={deletingId === tx.id}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Excluir Transação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* VIEW DESKTOP: Tabela Tradicional (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50/80 uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-5">Status (Pago)</th>
              <th className="py-3.5 px-5">Tipo</th>
              <th className="py-3.5 px-5">Data</th>
              <th className="py-3.5 px-5">Descrição</th>
              <th className="py-3.5 px-5">Categoria</th>
              <th className="py-3.5 px-5 text-right">Valor</th>
              <th className="py-3.5 px-5 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
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
                const isPaid = tx.is_paid !== undefined ? tx.is_paid : true;
                const isFuture = new Date(tx.date + 'T00:00:00').getTime() > new Date().setHours(0,0,0,0);

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Checkbox Interativo de Pago / Não Pago (Desktop) */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePaid(tx)}
                        disabled={togglingPaidId === tx.id}
                        className={`px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs hover:bg-amber-100'
                        }`}
                        title={isPaid ? 'Clique para marcar como Pendente' : 'Clique para marcar como Pago'}
                      >
                        {isPaid ? (
                          <>
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Pago</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Pendente</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Tipo com Ícone Visual */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-1.5 rounded-2xl border ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-rose-50 text-rose-600 border-rose-100'
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
                            isIncome ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isIncome ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                    </td>

                    {/* Data */}
                    <td className="py-4 px-5 whitespace-nowrap font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span>{formatDate(tx.date)}</span>
                        {isFuture && (
                          <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-full border border-sky-100 font-bold">
                            Agendado
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Descrição */}
                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-800">
                        {tx.description || <span className="text-slate-400 font-normal italic">Sem descrição</span>}
                      </span>
                    </td>

                    {/* Categoria */}
                    <td className="py-4 px-5 whitespace-nowrap">
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
                    <td className="py-4 px-5 whitespace-nowrap text-right font-extrabold text-sm">
                      <span className={isIncome ? 'text-emerald-600' : 'text-rose-600'}>
                        {isIncome ? '+ ' : '- '}
                        {formatCurrency(Number(tx.amount))}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-5 whitespace-nowrap text-center">
                      <button
                        onClick={() => setDeleteConfirmTxId(tx.id)}
                        disabled={deletingId === tx.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors"
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

      {/* Modal Personalizado de Confirmação */}
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
