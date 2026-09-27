import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface EvidenceHashBoxProps {
  hash: string;
  verified?: boolean;
  label?: string;
  className?: string;
}

export function EvidenceHashBox({ hash, verified = true, label = 'SHA-256 Evidence Hash', className = '' }: EvidenceHashBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    toast.success('Evidence SHA-256 copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-1.5 vajra-body-small text-slate-300">
        <span className="flex items-center gap-1.5 font-sans font-medium text-slate-300">
          {verified ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          {label}
        </span>
        <span
          className={`vajra-status px-1.5 py-1 rounded font-mono ${
            verified ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
          }`}
        >
          {verified ? 'INTEGRITY VERIFIED' : 'VERIFICATION FAILED'}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
        <span className="text-sm text-emerald-300 tracking-normal break-all select-all font-mono">
          {hash}
        </span>
        <button
          onClick={handleCopy}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          title="Copy SHA-256 Hash"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
