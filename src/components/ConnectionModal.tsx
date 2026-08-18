import React, { useState } from 'react';
import { X, Database, Check, FileText, Key, Link as LinkIcon } from 'lucide-react';
import { getStoredSupabaseConfig, updateSupabaseConfig } from '../lib/supabase';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [key, setKey] = useState(currentConfig.key);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseConfig(url.trim(), key.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onConfigSaved();
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setUrl('');
    setKey('');
    updateSupabaseConfig('', '');
    onConfigSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white border-t sm:border border-slate-300 rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative animate-in slide-in-from-bottom-5 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Conexão Supabase</h2>
            <p className="text-xs text-slate-700 font-bold">
              Insira as credenciais do seu projeto Supabase
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-emerald-700" /> Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white text-slate-900 rounded-xl px-4 py-2.5 text-base transition-colors outline-none font-bold min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-700" /> Supabase Anon Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white text-slate-900 rounded-xl px-4 py-2.5 text-base transition-colors outline-none font-bold min-h-[44px]"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 space-y-1.5 font-bold">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
              <FileText className="w-4 h-4 text-emerald-700" /> Script SQL
            </div>
            <p>
              Execute <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-300 font-extrabold">supabase_setup.sql</code> no SQL Editor do Supabase.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-3 text-xs text-slate-700 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors font-extrabold min-h-[44px]"
            >
              Modo Demo
            </button>

            <button
              type="submit"
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-5 py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 text-xs min-h-[44px]"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvo!</span>
                </>
              ) : (
                <span>Salvar Conexão</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
