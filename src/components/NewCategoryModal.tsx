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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900/90 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-in slide-in-from-bottom-5 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Nova Categoria</h2>
            <p className="text-xs text-slate-400 font-medium">
              Cadastre uma nova categoria no sistema
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Nome da Categoria
            </label>
            <input
              type="text"
              placeholder="Ex: Assinaturas, Mercado, Freelance..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 focus:bg-slate-950 text-white rounded-xl px-4 py-2.5 text-base transition-colors outline-none font-medium min-h-[44px]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Aplicar Para
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all min-h-[44px] ${
                  type === 'expense'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg'
                    : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Despesas
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all min-h-[44px] ${
                  type === 'income'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg'
                    : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Receitas
              </button>
              <button
                type="button"
                onClick={() => setType('both')}
                className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all min-h-[44px] ${
                  type === 'both'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-lg'
                    : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white'
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
              className="px-4 py-3 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors font-bold min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 text-xs min-h-[44px]"
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
