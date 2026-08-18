import React, { useState, useRef } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Plus, Calendar, Tag, FileText, DollarSign, Loader2, CheckSquare, Square } from 'lucide-react';
import { Category, Transaction, TransactionType } from '../types';

interface TransactionFormProps {
  categories: Category[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  onOpenNewCategoryModal: (type: TransactionType) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  categories,
  onAddTransaction,
  onOpenNewCategoryModal,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(todayStr);
  const [description, setDescription] = useState('');
  const [isPaid, setIsPaid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dateInputRef = useRef<HTMLInputElement>(null);

  const filteredCategories = categories.filter(
    (c) => c.type === 'both' || c.type === type
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor, informe um valor válido maior que zero.');
      return;
    }

    if (!date) {
      setError('Por favor, selecione uma data para a transação.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onAddTransaction({
        type,
        amount: numAmount,
        category_id: categoryId || null,
        date,
        description: description.trim() || null,
        is_paid: isPaid,
      });

      setAmount('');
      setDescription('');
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar transação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'CREATE_NEW') {
      onOpenNewCategoryModal(type);
      setCategoryId('');
    } else {
      setCategoryId(val);
    }
  };

  const handleOpenDatePicker = () => {
    const input = dateInputRef.current;
    if (input) {
      try {
        if (typeof input.showPicker === 'function') {
          input.showPicker();
        } else {
          input.focus();
        }
      } catch (err) {
        input.focus();
      }
    }
  };

  return (
    <div className="bg-white border border-slate-300 rounded-2xl p-4 sm:p-6 shadow-xs">
      <div className="flex items-center space-x-3 mb-5">
        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 shrink-0">
          <Plus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Nova Transação</h2>
          <p className="text-xs text-slate-700 font-bold">
            Cadastre uma receita ou despesa no sistema
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Tipo de Movimentação */}
        <div>
          <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
            Tipo de Movimentação
          </label>
          <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100 rounded-xl border border-slate-300">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId('');
              }}
              className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-lg font-extrabold text-xs transition-all active:scale-[0.98] min-h-[44px] ${
                type === 'expense'
                  ? 'bg-white text-rose-800 shadow-xs border border-slate-300'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>Despesa</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId('');
              }}
              className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-lg font-extrabold text-xs transition-all active:scale-[0.98] min-h-[44px] ${
                type === 'income'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-300'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Recebimento</span>
            </button>
          </div>
        </div>

        {/* Campo Valor & Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white text-slate-900 font-extrabold text-base rounded-xl pl-4 pr-4 py-2.5 transition-colors outline-none min-h-[44px]"
            />
          </div>

          <div>
            <label 
              onClick={handleOpenDatePicker}
              className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Data da Transação
            </label>
            <div className="relative">
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onClick={handleOpenDatePicker}
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white text-slate-900 rounded-xl px-4 py-2.5 text-base transition-colors outline-none font-bold min-h-[44px] cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Categoria Dropdown Dinâmico */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-700" /> Categoria
            </label>
            <button
              type="button"
              onClick={() => onOpenNewCategoryModal(type)}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-extrabold hover:underline py-1 px-2"
            >
              + Criar nova
            </button>
          </div>
          <select
            value={categoryId}
            onChange={handleCategorySelect}
            className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white text-slate-900 rounded-xl px-4 py-2.5 text-base transition-colors outline-none font-bold min-h-[44px]"
          >
            <option value="" className="text-slate-700">Selecione uma categoria (opcional)</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id} className="text-slate-900">
                {c.name}
              </option>
            ))}
            <option value="CREATE_NEW" className="text-emerald-800 font-extrabold">
              + Criar nova categoria...
            </option>
          </select>
        </div>

        {/* Descrição Opcional & Checkbox de Status Pago/Pendente */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-600" /> Descrição (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Aluguel de Maio, Salário..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white text-slate-900 rounded-xl px-4 py-2.5 text-base transition-colors outline-none font-bold min-h-[44px]"
            />
          </div>

          {/* Toggle Checkbox Pago / Pendente */}
          <div>
            <button
              type="button"
              onClick={() => setIsPaid(!isPaid)}
              className={`w-full py-2.5 px-3 rounded-xl border font-extrabold text-xs transition-all flex items-center justify-center space-x-2 min-h-[44px] ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
              }`}
            >
              {isPaid ? (
                <>
                  <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Pago / Concluído</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Pendente</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Botão Submit Touch-Friendly */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm shadow-xs transition-all flex items-center justify-center space-x-2 text-white active:scale-[0.99] min-h-[48px] ${
            type === 'expense'
              ? 'bg-rose-700 hover:bg-rose-800'
              : 'bg-emerald-700 hover:bg-emerald-800'
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>
                {type === 'expense' ? 'Adicionar Despesa' : 'Adicionar Recebimento'}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
