import React from 'react';
import { ShieldCheck } from 'lucide-react';

const EmptyState = ({
  title = 'No Records Found',
  description = 'No matching network events or security alerts were found in this query.',
  icon: Icon = ShieldCheck,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-400 mb-4 shadow-inner">
        <Icon className="w-10 h-10 text-cyan-400/70" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-medium tracking-wide transition-all shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
