import React, { useState } from 'react';
import { Calendar, ChevronRight, TrendingUp, TrendingDown, DollarSign, X, Tag, FileText, PieChart } from 'lucide-react';
import { Transaction, Category } from '../types';

interface MonthlyComparatorProps {
  transactions: Transaction[];
  categories: Category[];
}

interface MonthSummary {
  yearMonth: string; // 'YYYY-MM'
  label: string; // 'Agosto 2026'
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}

export const MonthlyComparator: React.FC<MonthlyComparatorProps> = ({ transactions, categories }) => {
  const [selectedMonth, setSelectedMonth] = useState<MonthSummary | null>(null);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const monthGroups: { [key: string]: Transaction[] } = {};

  transactions.forEach((tx) => {
    if (!tx.date) return;
    const parts = tx.date.split('-');
    if (parts.length < 2) return;
    const yearMonth = `${parts[0]}-${parts[1]}`;
    if (!monthGroups[yearMonth]) {
      monthGroups[yearMonth] = [];
    }
    monthGroups[yearMonth].push(tx);
  });

  const sortedYearMonths = Object.keys(monthGroups).sort((a, b) => b.localeCompare(a));

  const summaries: MonthSummary[] = sortedYearMonths.map((ym) => {
    const [yearStr, monthStr] = ym.split('-');
    const year = parseInt(yearStr, 10);
    const monthIdx = parseInt(monthStr, 10) - 1;

    const txs = monthGroups[ym];
    const income = txs
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = txs
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    return {
      yearMonth: ym,
      label: `${monthNames[monthIdx] || monthStr} ${year}`,
      income,
      expense,
      balance: income - expense,
      transactions: txs,
    };
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
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

  const getCategoryBreakdown = (monthTxs: Transaction[]) => {
    const expenses = monthTxs.filter((t) => t.type === 'expense');
    const totalExp = expenses.reduce((acc, t) => acc + Number(t.amount), 0);

    const map: { [name: string]: number } = {};
    expenses.forEach((t) => {
      const name = t.category?.name || 'Outras Despesas';
      map[name] = (map[name] || 0) + Number(t.amount);
    });

    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  if (summaries.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
            Comparativo Mensal de Valores
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Clique em qualquer mês para ver os detalhes completos de gastos e receitas
          </p>
        </div>
      </div>

      {/* Grid de Cards de Meses em Light Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {summaries.map((m) => {
          const isPositive = m.balance >= 0;

          return (
            <div
              key={m.yearMonth}
              onClick={() => setSelectedMonth(m)}
              className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 transition-all cursor-pointer group shadow-2xs relative"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  {m.label}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  Detalhes <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Receitas</span>
                  <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> {formatCurrency(m.income)}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Despesas</span>
                  <span className="text-xs font-extrabold text-rose-600 flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" /> {formatCurrency(m.expense)}
                  </span>
                </div>
              </div>

              {/* Saldo Líquido do Mês */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Saldo do Mês</span>
                <span className={`text-sm font-extrabold ${isPositive ? 'text-slate-900' : 'text-rose-600'}`}>
                  {formatCurrency(m.balance)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE DETALHES DO MÊS SELECIONADO (LIGHT MODE) */}
      {selectedMonth && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col p-5 sm:p-6 shadow-2xl relative animate-in slide-in-from-bottom-5 duration-200 overflow-hidden">
            
            {/* Header do Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Detalhamento de {selectedMonth.label}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedMonth.transactions.length} movimentações registradas neste mês
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMonth(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo do Modal com Scroll */}
            <div className="overflow-y-auto flex-1 py-4 space-y-6 pr-1">
              
              {/* Resumo do Mês */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Receitas</span>
                  <span className="text-sm sm:text-base font-extrabold text-emerald-600">
                    {formatCurrency(selectedMonth.income)}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Despesas</span>
                  <span className="text-sm sm:text-base font-extrabold text-rose-600">
                    {formatCurrency(selectedMonth.expense)}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Saldo</span>
                  <span className={`text-sm sm:text-base font-extrabold ${selectedMonth.balance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                    {formatCurrency(selectedMonth.balance)}
                  </span>
                </div>
              </div>

              {/* Gastos por Categoria neste Mês */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-emerald-600" />
                  Gastos por Categoria em {selectedMonth.label}
                </h4>
                
                {getCategoryBreakdown(selectedMonth.transactions).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhuma despesa registrada neste mês.</p>
                ) : (
                  <div className="space-y-2">
                    {getCategoryBreakdown(selectedMonth.transactions).map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-emerald-600" />
                          {cat.name}
                        </span>
                        <span className="font-semibold text-slate-600">
                          {formatCurrency(cat.amount)} ({cat.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lista Detalhada de Transações do Mês */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Todas as Movimentações do Mês
                </h4>

                <div className="space-y-2">
                  {selectedMonth.transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((tx) => {
                      const isInc = tx.type === 'income';
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className={`p-1.5 rounded-lg border ${isInc ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                              {isInc ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                {tx.description || <span className="text-slate-400 font-normal italic">Sem descrição</span>}
                              </p>
                              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                {formatDate(tx.date)} {tx.category ? `• ${tx.category.name}` : ''}
                              </span>
                            </div>
                          </div>

                          <span className={`text-xs font-extrabold ${isInc ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isInc ? '+ ' : '- '}
                            {formatCurrency(Number(tx.amount))}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>

            {/* Footer do Modal */}
            <div className="pt-3 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedMonth(null)}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800 transition-colors min-h-[44px]"
              >
                Fechar Detalhes
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
