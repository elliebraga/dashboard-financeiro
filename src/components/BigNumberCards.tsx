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
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Resumo Financeiro</span>
        </h2>

        <div className="flex items-center bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onPeriodChange('current_month')}
            className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              selectedPeriod === 'current_month'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mês Atual
          </button>
          <button
            onClick={() => onPeriodChange('all')}
            className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              selectedPeriod === 'all'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tudo
          </button>
        </div>
      </div>

      {/* Grid de Cards Principais em Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Card Destaque: Valor Total (Big Number) */}
        <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl hover:border-slate-700/80 transition-all group">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none"></div>

          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Valor Total
            </span>
            <div className={`p-2 sm:p-2.5 rounded-xl border ${
              balance >= 0 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${
              balance >= 0 ? 'text-white' : 'text-rose-400'
            }`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Taxa de Poupança: <span className="font-bold text-emerald-400">{savingsRate}%</span>
            </p>
          </div>
        </div>

        {/* Card Menor: Total de Receitas */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl hover:border-slate-700/80 transition-all flex sm:block items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Receitas (+ Entrada)
            </span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 hidden sm:block">
              Entradas no período
            </p>
          </div>
          <div className="p-2 sm:p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Card Menor: Total de Despesas */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl hover:border-slate-700/80 transition-all flex sm:block items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Despesas (- Saída)
            </span>
            <div className="text-xl sm:text-2xl font-bold text-rose-400">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 hidden sm:block">
              Saídas no período
            </p>
          </div>
          <div className="p-2 sm:p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 shrink-0">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Banner de Projeção em Glassmorphism (Até Dia 15 e Até Dia 30) */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Projeções no Mês
            </h3>
            <p className="text-[11px] text-slate-400 font-medium leading-tight">
              Saldo estimado com transações agendadas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
          {/* Card Projeção até Dia 15 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-center">
            <span className="block text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Até o Dia 15
            </span>
            <span className={`text-sm sm:text-base font-extrabold ${until15thBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatCurrency(until15thBalance)}
            </span>
          </div>

          {/* Card Projeção até Dia 30 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-center">
            <span className="block text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Até o Dia 30
            </span>
            <span className={`text-sm sm:text-base font-extrabold ${until30thBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatCurrency(until30thBalance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
