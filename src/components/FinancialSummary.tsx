import React from 'react';
import { PieChart as PieIcon, Sparkles } from 'lucide-react';
import { Transaction } from '../types';

interface FinancialSummaryProps {
  transactions: Transaction[];
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ transactions }) => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((acc, t) => acc + Number(t.amount), 0);

  const categoryMap: { [name: string]: number } = {};
  expenses.forEach((t) => {
    const name = t.category?.name || 'Outras Despesas';
    categoryMap[name] = (categoryMap[name] || 0) + Number(t.amount);
  });

  const categoryList = Object.entries(categoryMap)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const colors = [
    'bg-rose-400',
    'bg-amber-400',
    'bg-sky-400',
    'bg-emerald-400',
    'bg-purple-400',
    'bg-pink-400',
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100/80">
          <PieIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
            Distribuição de Gastos
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Análise percentual por categoria
          </p>
        </div>
      </div>

      {categoryList.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center">
          Nenhuma despesa registrada para exibir estatísticas.
        </p>
      ) : (
        <div className="space-y-3.5 pt-2">
          {categoryList.slice(0, 5).map((cat, idx) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`}></span>
                  {cat.name}
                </span>
                <span className="text-slate-500 font-semibold">
                  {formatCurrency(cat.amount)} ({cat.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/80 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors[idx % colors.length]}`}
                  style={{ width: `${Math.min(100, cat.percentage)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
