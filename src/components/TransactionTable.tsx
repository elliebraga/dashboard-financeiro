import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Filter, Trash2, Calendar, Tag, AlertCircle, CheckSquare, Square, CheckCircle2, Clock } from 'lucide-react';
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
    <div className="bg-white border border-slate-300 rounded-2xl shadow-xs overflow-hidden">
      {/* Header & Filtros */}
      <div className="p-4 sm:p-6 border-b border-slate-300 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700 shrink-0" />
              Histórico de Movimentações
            </h2>
            <p className="text-xs text-slate-700 font-bold mt-0.5">
              {filtered.length} {filtered.length === 1 ? 'transação encontrada' : 'transações encontradas'}
            </p>
          </div>

          {/* Filtro por tipo */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`py-1.5 px-3 text-xs font-extrabold rounded-lg transition-all text-center ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`py-1.5 px-3 text-xs font-extrabold rounded-lg transition-all text-center ${
                filterType === 'income'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-300'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`py-1.5 px-3 text-xs font-extrabold rounded-lg transition-all text-center ${
                filterType === 'expense'
                  ? 'bg-white text-rose-800 shadow-xs border border-slate-300'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Despesas
            </button>
          </div>
        </div>

        {/* Campo de Busca & Filtros (Categoria & Status Pago/Pendente) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-base transition-colors outline-none font-bold min-h-[44px]"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-base transition-colors outline-none font-bold appearance-none min-h-[44px]"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status (Pago vs Pendente) */}
          <div className="relative">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-base transition-colors outline-none font-bold appearance-none min-h-[44px]"
            >
              <option value="all">Status: Todos</option>
              <option value="paid">Status: Apenas Pagos</option>
              <option value="unpaid">Status: Apenas Pendentes</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MOBILE: Lista de Cards Responsivos (< md) */}
      <div className="block md:hidden divide-y divide-slate-200">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-800">Nenhuma transação encontrada</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isIncome = tx.type === 'income';
            const isPaid = tx.is_paid !== undefined ? tx.is_paid : true;
            const isFuture = new Date(tx.date + 'T00:00:00').getTime() > new Date().setHours(0,0,0,0);

            return (
              <div key={tx.id} className="p-4 space-y-2.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`p-1.5 rounded-xl border ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      {formatDate(tx.date)}
                      {isFuture && (
                        <span className="text-[10px] bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded border border-blue-300 font-extrabold">
                          Agendado
                        </span>
                      )}
                    </span>
                  </div>

                  <span className={`text-base font-extrabold ${isIncome ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {isIncome ? '+ ' : '- '}
                    {formatCurrency(Number(tx.amount))}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      {tx.description || <span className="text-slate-500 font-semibold italic">Sem descrição</span>}
                    </p>
                    {tx.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300 mt-1">
                        <Tag className="w-3 h-3 text-emerald-700" />
                        {tx.category.name}
                      </span>
                    )}
                  </div>

                  {/* Checkbox Interativo de Pago / Não Pago (Mobile) */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTogglePaid(tx)}
                      disabled={togglingPaidId === tx.id}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs hover:bg-amber-100'
                      }`}
                      title={isPaid ? 'Marcar como Pendente' : 'Marcar como Pago'}
                    >
                      {isPaid ? (
                        <>
                          <CheckSquare className="w-4 h-4 text-emerald-700" />
                          <span>Pago</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-4 h-4 text-amber-700" />
                          <span>Pendente</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setDeleteConfirmTxId(tx.id)}
                      disabled={deletingId === tx.id}
                      className="p-2 text-slate-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
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
        <table className="w-full text-left text-xs text-slate-900">
          <thead className="bg-slate-100 uppercase tracking-wider text-slate-800 font-extrabold border-b border-slate-300">
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
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-600">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-500" />
                    <p className="font-extrabold text-sm text-slate-900">Nenhuma transação encontrada</p>
                    <p className="text-xs text-slate-700 font-semibold">Adicione uma nova movimentação no formulário acima</p>
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
                    className="hover:bg-slate-100/70 transition-colors group"
                  >
                    {/* Checkbox Interativo de Pago / Não Pago (Desktop) */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePaid(tx)}
                        disabled={togglingPaidId === tx.id}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs hover:bg-amber-100'
                        }`}
                        title={isPaid ? 'Clique para marcar como Pendente' : 'Clique para marcar como Pago'}
                      >
                        {isPaid ? (
                          <>
                            <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>Pago</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>Pendente</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Tipo com Ícone Visual */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-1.5 rounded-xl border ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>
                        <span
                          className={`font-extrabold ${
                            isIncome ? 'text-emerald-800' : 'text-rose-800'
                          }`}
                        >
                          {isIncome ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                    </td>

                    {/* Data */}
                    <td className="py-4 px-5 whitespace-nowrap font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{formatDate(tx.date)}</span>
                        {isFuture && (
                          <span className="text-[10px] bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded border border-blue-300 font-extrabold">
                            Agendado
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Descrição */}
                    <td className="py-4 px-5">
                      <span className="font-extrabold text-slate-900">
                        {tx.description || <span className="text-slate-500 font-semibold italic">Sem descrição</span>}
                      </span>
                    </td>

                    {/* Categoria */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      {tx.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-900 border border-slate-300">
                          <Tag className="w-3 h-3 text-emerald-700" />
                          {tx.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs font-semibold">Sem categoria</span>
                      )}
                    </td>

                    {/* Valor */}
                    <td className="py-4 px-5 whitespace-nowrap text-right font-extrabold text-sm">
                      <span className={isIncome ? 'text-emerald-800' : 'text-rose-800'}>
                        {isIncome ? '+ ' : '- '}
                        {formatCurrency(Number(tx.amount))}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-5 whitespace-nowrap text-center">
                      <button
                        onClick={() => setDeleteConfirmTxId(tx.id)}
                        disabled={deletingId === tx.id}
                        className="p-1.5 text-slate-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* Modal Personalizado de Confirmação em Light Mode */}
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
