import React from 'react';
import { Wallet, Database, CheckCircle2, AlertCircle, Settings, LogOut } from 'lucide-react';
import { getStoredSupabaseConfig } from '../lib/supabase';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onOpenConnectionModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenConnectionModal,
  onLogout,
}) => {
  const config = getStoredSupabaseConfig();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="p-2 bg-emerald-700 text-white rounded-xl shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Finanças<span className="text-emerald-700">Dash</span>
              </h1>
              <p className="text-[11px] text-slate-700 hidden sm:block font-bold">
                Gestão e Controle Financeiro Pessoal
              </p>
            </div>
          </div>

          {/* User Info & Connection Status & Settings */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Usuário Logado */}
            {currentUser && (
              <div className="flex items-center space-x-2 bg-slate-100 pl-2.5 pr-1.5 py-1 rounded-full border border-slate-300">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-extrabold">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-xs font-extrabold text-slate-900 hidden md:inline">
                  {currentUser.name}
                </span>
                <button
                  onClick={onLogout}
                  className="p-1 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors"
                  title="Sair da Conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Status da Conexão */}
            <button
              onClick={onOpenConnectionModal}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                config.isConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {config.isConfigured ? 'Supabase' : 'Demo'}
              </span>
              {config.isConfigured ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
              )}
            </button>

            <button
              onClick={onOpenConnectionModal}
              className="p-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-300 min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Configurações de Conexão com Supabase"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
