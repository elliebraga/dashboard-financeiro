import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = true,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white border-t sm:border border-slate-300 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-in slide-in-from-bottom-5 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div
            className={`p-2.5 rounded-xl border shrink-0 ${
              isDanger
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-700 font-bold">{message}</p>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-extrabold min-h-[44px]"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-3 rounded-xl font-extrabold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 text-white min-h-[44px] ${
              isDanger
                ? 'bg-rose-700 hover:bg-rose-800'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
