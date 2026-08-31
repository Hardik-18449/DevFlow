import React from 'react';
import { AlertCircle, ArrowUpRight, ArrowRight, ArrowDown } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  const styles = {
    URGENT: { label: 'URGENT', icon: AlertCircle, color: 'bg-danger/15 text-danger border-danger/30' },
    HIGH: { label: 'HIGH', icon: ArrowUpRight, color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    MEDIUM: { label: 'MEDIUM', icon: ArrowRight, color: 'bg-accent/15 text-accent border-accent/30' },
    LOW: { label: 'LOW', icon: ArrowDown, color: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  };

  const conf = styles[priority] || styles.MEDIUM;
  const Icon = conf.icon;

  return (
    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded border uppercase tracking-wider flex items-center gap-1 ${conf.color}`}>
      <Icon size={10} />
      {conf.label}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const labels = {
    BACKLOG: 'Backlog',
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    BLOCKED: 'Blocked',
    DONE: 'Done',
  };

  const colors = {
    BACKLOG: 'bg-white/5 text-textMuted border-white/10',
    TODO: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    IN_REVIEW: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    BLOCKED: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    DONE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  };

  return (
    <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${colors[status] || colors.TODO}`}>
      {labels[status] || status}
    </span>
  );
};
