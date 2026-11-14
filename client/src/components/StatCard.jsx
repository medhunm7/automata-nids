import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'cyan', trend }) => {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      glow: 'shadow-glow-cyan',
      text: 'text-cyan-400'
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      glow: '',
      text: 'text-emerald-400'
    },
    red: {
      border: 'border-red-500/20 hover:border-red-500/50',
      iconBg: 'bg-red-500/10 text-red-400',
      glow: 'shadow-glow-danger',
      text: 'text-red-400'
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: '',
      text: 'text-amber-400'
    },
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/50',
      iconBg: 'bg-blue-500/10 text-blue-400',
      glow: '',
      text: 'text-blue-400'
    }
  };

  const scheme = colorMap[color] || colorMap.cyan;

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-slate-900/60 dark:bg-slate-900/80 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 ${scheme.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-400">{title}</p>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-white dark:text-white font-mono">
            {value !== undefined && value !== null ? value : '--'}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
              {trend && <span className={trend > 0 ? 'text-emerald-400' : 'text-slate-400'}>{trend > 0 ? `+${trend}` : trend}</span>}
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-lg p-3 ${scheme.iconBg}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-${color}-500/40 to-transparent`} />
    </div>
  );
};

export default StatCard;
