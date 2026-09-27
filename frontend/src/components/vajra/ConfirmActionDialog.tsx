import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface ConfirmActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isSubmitting?: boolean;
}

export function ConfirmActionDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm Action',
  variant = 'warning',
  isSubmitting = false,
}: ConfirmActionDialogProps) {
  if (!isOpen) return null;

  let btnColor = 'bg-amber-600 hover:bg-amber-500 text-white';
  if (variant === 'danger') btnColor = 'bg-rose-600 hover:bg-rose-500 text-white';
  else if (variant === 'info') btnColor = 'bg-blue-600 hover:bg-blue-500 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-sans">
          <span className="font-semibold text-amber-400">Operational Disclaimer:</span> Seizure, freezing, or physical dispatch requests are recorded in the cryptographic audit chain with your Officer ID.
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold shadow-lg transition-colors flex items-center gap-1.5 ${btnColor} disabled:opacity-50`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isSubmitting ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
