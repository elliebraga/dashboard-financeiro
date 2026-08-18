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
    'bg-rose-600',
    'bg-amber-600',
    'bg-sky-600',
    'bg-indigo-600',
    'bg-emerald-600',
    'bg-violet-600',
  ];

  return (
    <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
          <PieIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Distribuição de Gastos</h2>
          <p className="text-xs text-slate-700 font-bold">
            Análise percentual por categoria
          </p>
        </div>
      </div>

      {categoryList.length === 0 ? (
        <p className="text-xs text-slate-600 font-semibold py-6 text-center">
          Nenhuma despesa registrada para exibir estatísticas.
        </p>
      ) : (
        <div className="space-y-3.5 pt-2">
          {categoryList.slice(0, 5).map((cat, idx) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-slate-900 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`}></span>
                  {cat.name}
                </span>
                <span className="text-slate-700">
                  {formatCurrency(cat.amount)} ({cat.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-300">
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
