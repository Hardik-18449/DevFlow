import React from 'react';

export const StatCard = ({ title, value, icon: Icon, change, subtitle }) => {
  return (
    <div className="p-4 rounded-xl bg-cardBg border border-borderColor hover:border-accent/40 transition-all shadow-subtle group hover:bg-cardHover">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-textMuted uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-bgSecondary text-accent border border-borderColor group-hover:border-accent/30 transition-colors">
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="mt-2.5 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-textPrimary font-mono tracking-tight">{value}</span>
        {change && (
          <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            ↑ {change}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-[11px] text-textMuted truncate">{subtitle}</p>}
    </div>
  );
};
