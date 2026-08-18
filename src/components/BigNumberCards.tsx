import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Calendar, Clock, CalendarDays, ChevronDown, Sparkles } from 'lucide-react';
import { Transaction } from '../types';

interface BigNumberCardsProps {
  transactions: Transaction[];
  selectedPeriod: string; // 'all' ou 'YYYY-MM' (ex: '2026-08')
  onPeriodChange: (period: string) => void;
}

export const BigNumberCards: React.FC<BigNumberCardsProps> = ({
  transactions,
  selectedPeriod,
  onPeriodChange,
}) => {
  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(currentYM);

    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.substring(0, 7));
      }
    });

    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [transactions, currentYM]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const formatMonthLabel = (ym: string) => {
    if (ym === 'all') return 'Todo o Período (Visão Geral)';
    const [yearStr, monthStr] = ym.split('-');
    const monthIdx = parseInt(monthStr, 10) - 1;
    const name = monthNames[monthIdx] || monthStr;
    const isCurrent = ym === currentYM;
    return `${isCurrent ? 'Mês Atual • ' : ''}${name} de ${yearStr}`;
  };

  const filteredTransactions = transactions.filter((t) => {
    if (selectedPeriod === 'all') return true;
    return t.date && t.date.startsWith(selectedPeriod);
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  const targetYear = selectedPeriod === 'all' ? now.getFullYear() : parseInt(selectedPeriod.split('-')[0], 10);
  const targetMonthIdx = selectedPeriod === 'all' ? now.getMonth() : parseInt(selectedPeriod.split('-')[1], 10) - 1;

  const day15Limit = new Date(targetYear, targetMonthIdx, 15, 23, 59, 59);
  const day30Limit = new Date(targetYear, targetMonthIdx, 30, 23, 59, 59);

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
    <div className="space-y-3.5 sm:space-y-4 w-full">
      {/* Header com Dropdown de Seleção por Mês */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100/80 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              Consulta por Período
              <Sparkles className="w-3 h-3 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-700 font-bold">
              Selecione o mês desejado para ver o balanço
            </p>
          </div>
        </div>

        {/* Dropdown de Seleção de Mês */}
        <div className="relative w-full sm:w-auto min-w-[240px]">
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 font-bold text-xs rounded-2xl pl-4 pr-10 py-3 sm:py-2.5 transition-colors outline-none cursor-pointer appearance-none min-h-[48px]"
          >
            <option value="all">🌐 Todo o Período (Visão Geral)</option>
            <optgroup label="Filtrar por Mês">
              {availableMonths.map((ym) => (
                <option key={ym} value={ym}>
                  {formatMonthLabel(ym)}
                </option>
              ))}
            </optgroup>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Grid de Cards Principais com Paddings Garantidos (p-5 sm:p-6) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Card 1: Valor Total (Big Number) */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
              Valor Total
            </span>
            <div className={`p-2.5 rounded-2xl border shrink-0 ${
              balance >= 0 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : 'bg-rose-50 text-rose-600 border-rose-100'
            }`}>
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight break-all ${
              balance >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1 font-bold">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Taxa de Poupança: <span className="font-extrabold text-emerald-600">{savingsRate}%</span>
            </p>
          </div>
        </div>

        {/* Card 2: Total de Receitas */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between gap-3 overflow-hidden">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1 truncate">
              Total Receitas (+ Entrada)
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 break-all">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1 hidden sm:block truncate">
              Entradas no período selecionado
            </p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Total de Despesas */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between gap-3 overflow-hidden">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1 truncate">
              Total Despesas (- Saída)
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-600 break-all">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1 hidden sm:block truncate">
              Saídas no período selecionado
            </p>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Banner de Projeção em Cards Arredondados */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100 shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 truncate">
              <CalendarDays className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              Projeções {selectedPeriod === 'all' ? 'no Mês Atual' : `para ${formatMonthLabel(selectedPeriod)}`}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              Saldo estimado acumulado com transações agendadas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
          {/* Card Projeção até Dia 15 */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-center">
            <span className="block text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Até o Dia 15
            </span>
            <span className={`text-sm sm:text-base font-extrabold ${until15thBalance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
              {formatCurrency(until15thBalance)}
            </span>
          </div>

          {/* Card Projeção até Dia 30 */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-center">
            <span className="block text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Até o Dia 30
            </span>
            <span className={`text-sm sm:text-base font-extrabold ${until30thBalance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
              {formatCurrency(until30thBalance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
