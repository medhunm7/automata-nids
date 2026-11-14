import React from 'react';

const SeverityBadge = ({ severity, size = 'md' }) => {
  const sev = (severity || 'Medium').toLowerCase();

  const configs = {
    critical: {
      bg: 'bg-red-500/10 text-red-400 border-red-500/30 dark:border-red-500/40 shadow-glow-danger',
      dot: 'bg-red-500 animate-pulse',
      label: 'Critical'
    },
    high: {
      bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30 dark:border-orange-500/40',
      dot: 'bg-orange-500',
      label: 'High'
    },
    medium: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30 dark:border-amber-500/40',
      dot: 'bg-amber-500',
      label: 'Medium'
    },
    low: {
      bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 dark:border-cyan-500/40',
      dot: 'bg-cyan-500',
      label: 'Low'
    }
  };

  const current = configs[sev] || configs.medium;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${sizeClasses} tracking-wide uppercase transition-all duration-200`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      {current.label}
    </span>
  );
};

export default SeverityBadge;
