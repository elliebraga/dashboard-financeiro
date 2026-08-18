import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Calendar, Clock, CalendarDays } from 'lucide-react';
import { Transaction } from '../types';

interface BigNumberCardsProps {
  transactions: Transaction[];
  selectedPeriod: 'all' | 'current_month';
  onPeriodChange: (period: 'all' | 'current_month') => void;
}

export const BigNumberCards: React.FC<BigNumberCardsProps> = ({
  transactions,
  selectedPeriod,
  onPeriodChange,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const filteredTransactions = transactions.filter((t) => {
    if (selectedPeriod === 'all') return true;
    const tDate = new Date(t.date + 'T00:00:00');
    return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  // Cálculo da Projeção de Valor Total acumulado até o dia 15 e até o dia 30 do mês atual
  const day15Limit = new Date(currentYear, currentMonth, 15, 23, 59, 59);
  const day30Limit = new Date(currentYear, currentMonth, 30, 23, 59, 59);

  const until15thBalance = transactions
    .filter((t) => {
      const tDate = new Date(t.date + 'T00:00:00');
      return tDate <= day15Limit;
    })
    .reduce((acc, t) => {
      const amt = Number(t.amount);
      return t.type === 'income' ? acc + amt : acc - amt;
    }, 0);

  const until30thBalance = transactions
    .filter((t) => {
      const tDate = new Date(t.date + 'T00:00:00');
      return tDate <= day30Limit;
    })
    .reduce((acc, t) => {
      const amt = Number(t.amount);
      return t.type === 'income' ? acc + amt : acc - amt;
    }, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header do filtro de período */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Resumo Financeiro</span>
        </h2>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300">
          <button
            onClick={() => onPeriodChange('current_month')}
            className={`px-2.5 sm:px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
              selectedPeriod === 'current_month'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-300'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Mês Atual
          </button>
          <button
            onClick={() => onPeriodChange('all')}
            className={`px-2.5 sm:px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
              selectedPeriod === 'all'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-300'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Tudo
          </button>
        </div>
      </div>

      {/* Grid de Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Card Destaque: Valor Total (Big Number) */}
        <div className="bg-white border border-slate-300 rounded-2xl p-4 sm:p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Valor Total
            </span>
            <div className={`p-2 sm:p-2.5 rounded-xl border ${
              balance >= 0 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${
              balance >= 0 ? 'text-slate-900' : 'text-rose-700'
            }`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-slate-700 flex items-center gap-1.5 pt-0.5 font-bold">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              Taxa de Poupança: <span className="font-extrabold text-emerald-800">{savingsRate}%</span>
            </p>
          </div>
        </div>

        {/* Card Menor: Total de Receitas */}
        <div className="bg-white border border-slate-300 rounded-2xl p-4 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex sm:block items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
              Total Receitas (+ Entrada)
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-[11px] text-slate-600 font-bold mt-1 hidden sm:block">
              Entradas no período
            </p>
          </div>
          <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Card Menor: Total de Despesas */}
        <div className="bg-white border border-slate-300 rounded-2xl p-4 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex sm:block items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
              Total Despesas (- Saída)
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-700">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-[11px] text-slate-600 font-bold mt-1 hidden sm:block">
              Saídas no período
            </p>
          </div>
          <div className="p-2 sm:p-2.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 shrink-0">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Banner de Projeção de Valor Acumulado (Até Dia 15 e Até Dia 30) */}
      <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-100 text-slate-800 rounded-xl border border-slate-300 shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              Projeções no Mês
            </h3>
            <p className="text-[11px] text-slate-700 font-bold leading-tight">
              Saldo estimado com transações agendadas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
          {/* Card Projeção até Dia 15 */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-center">
            <span className="block text-[10px] sm:text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
              Até o Dia 15
            </span>
            <span className={`text-sm sm:text-base font-extrabold ${until15thBalance >= 0 ? 'text-slate-900' : 'text-rose-700'}`}>
              {formatCurrency(until15thBalance)}
            </span>
          </div>

          {/* Card Projeção até Dia 30 */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-center">
            <span className="block text-[10px] sm:text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
              Até o Dia 30
            </span>
            <span className={`text-sm sm:text-base font-extrabold ${until30thBalance >= 0 ? 'text-slate-900' : 'text-rose-700'}`}>
              {formatCurrency(until30thBalance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
