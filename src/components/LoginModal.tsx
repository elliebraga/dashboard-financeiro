import React, { useState } from 'react';
import { Lock, User as UserIcon, LogIn, Key, Loader2, ShieldCheck } from 'lucide-react';
import { loginUserApi } from '../lib/supabase';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha o usuário e a senha.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await loginUserApi(username, password);
      onLoginSuccess(user);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Usuário ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelectUser = (user: string) => {
    setUsername(user);
    setPassword('Mofsv@2507');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Acesso ao Dashboard</h2>
          <p className="text-xs text-slate-500 font-semibold">
            Insira suas credenciais de acesso autorizadas
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-emerald-600" /> Usuário
            </label>
            <input
              type="text"
              placeholder="ellieb ou lizfnery"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 rounded-xl px-4 py-2.5 text-base transition-colors outline-none font-semibold min-h-[44px]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-600" /> Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-900 rounded-xl px-4 py-2.5 text-base transition-colors outline-none font-semibold min-h-[44px]"
            />
          </div>

          {/* Atalhos Rápidos de Seleção */}
          <div className="pt-1">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Seleção Rápida de Usuária
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelectUser('ellieb')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                  username === 'ellieb'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Ellie Braga
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelectUser('lizfnery')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                  username === 'lizfnery'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Liz Nery
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 min-h-[48px] active:scale-[0.99]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Entrar na Planilha</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
