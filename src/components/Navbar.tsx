import React from 'react';
import { Wallet, Database, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import { getStoredSupabaseConfig } from '../lib/supabase';

interface NavbarProps {
  onOpenConnectionModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenConnectionModal }) => {
  const config = getStoredSupabaseConfig();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Finanças<span className="text-emerald-600">Dash</span>
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Gestão e Controle Financeiro Pessoal
              </p>
            </div>
          </div>

          {/* Connection Status & Settings */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenConnectionModal}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                config.isConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {config.isConfigured ? 'Supabase Conectado' : 'Modo Demo (Local)'}
              </span>
              <span className="sm:hidden">
                {config.isConfigured ? 'Supabase' : 'Demo'}
              </span>
              {config.isConfigured ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
            </button>

            <button
              onClick={onOpenConnectionModal}
              className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 min-h-[38px] min-w-[38px] flex items-center justify-center"
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
