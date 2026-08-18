import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Calendar, Clock, CalendarDays, ChevronDown } from 'lucide-react';
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

  // Extrai lista única de meses disponíveis nas transações (ex: ['2026-08', '2026-07', ...])
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(currentYM); // Garante que o mês atual sempre exista na lista

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

  // Filtragem das transações pelo período selecionado
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

  // Determinar o ano e mês para o cálculo das projeções (15 e 30)
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
    <div className="space-y-3 sm:space-y-4">
      {/* Header com Sistema de Filtro Dropdown por Mês */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-300 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Consulta por Período
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
            className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white text-slate-900 font-extrabold text-sm rounded-xl pl-4 pr-10 py-2.5 transition-colors outline-none cursor-pointer appearance-none min-h-[44px]"
          >
            <option value="all" className="font-extrabold text-slate-900">
              🌐 Todo o Período (Visão Geral)
            </option>
            <optgroup label="Filtrar por Mês">
              {availableMonths.map((ym) => (
                <option key={ym} value={ym} className="font-bold text-slate-900">
                  {formatMonthLabel(ym)}
                </option>
              ))}
            </optgroup>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              Entradas no período selecionado
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
              Saídas no período selecionado
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
              Projeções {selectedPeriod === 'all' ? 'no Mês Atual' : `para ${formatMonthLabel(selectedPeriod)}`}
            </h3>
            <p className="text-[11px] text-slate-700 font-bold leading-tight">
              Saldo estimado acumulado com transações agendadas
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
