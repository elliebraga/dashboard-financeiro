import React, { useState } from 'react';
import { X, Tag, Plus, Loader2 } from 'lucide-react';
import { Category, TransactionType } from '../types';

interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: (category: Category) => void;
  initialType?: TransactionType;
  createCategoryFn: (name: string, type: TransactionType | 'both') => Promise<Category>;
}

export const NewCategoryModal: React.FC<NewCategoryModalProps> = ({
  isOpen,
  onClose,
  onCategoryCreated,
  initialType = 'expense',
  createCategoryFn,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType | 'both'>(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome da categoria.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newCategory = await createCategoryFn(name.trim(), type);
      onCategoryCreated(newCategory);
      setName('');
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao criar categoria. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-in slide-in-from-bottom-5 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Nova Categoria</h2>
            <p className="text-xs text-slate-500 font-medium">
              Cadastre uma nova categoria no sistema
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Nome da Categoria
            </label>
            <input
              type="text"
              placeholder="Ex: Assinaturas, Mercado, Freelance..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 rounded-xl px-4 py-2.5 text-base transition-colors outline-none font-medium min-h-[44px]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Aplicar Para
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all min-h-[44px] ${
                  type === 'expense'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Despesas
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all min-h-[44px] ${
                  type === 'income'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Receitas
              </button>
              <button
                type="button"
                onClick={() => setType('both')}
                className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all min-h-[44px] ${
                  type === 'both'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Ambos
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 text-xs min-h-[44px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Salvar Categoria</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
