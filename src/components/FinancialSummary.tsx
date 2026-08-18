import React from 'react';
import { PieChart as PieIcon } from 'lucide-react';
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
    'bg-rose-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-cyan-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
          <PieIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white">Distribuição de Gastos</h2>
          <p className="text-xs text-slate-400">
            Análise percentual por categoria
          </p>
        </div>
      </div>

      {categoryList.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">
          Nenhuma despesa registrada para exibir estatísticas.
        </p>
      ) : (
        <div className="space-y-3.5 pt-2">
          {categoryList.slice(0, 5).map((cat, idx) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-200 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`}></span>
                  {cat.name}
                </span>
                <span className="text-slate-400">
                  {formatCurrency(cat.amount)} ({cat.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-slate-800">
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
