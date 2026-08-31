import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PriorityBadge } from '../ui/Badge';
import { Paperclip, Calendar, User } from 'lucide-react';

export const TaskCard = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={`p-3.5 rounded-xl bg-cardBg border border-borderColor hover:border-accent/50 transition-all shadow-subtle cursor-grab active:cursor-grabbing group ${
        isDragging ? 'shadow-elevated border-accent scale-102 ring-2 ring-accent/30' : 'hover:bg-cardHover'
      }`}
    >
      {/* Key & Priority Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
          #{task.taskKey}
        </span>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-semibold text-textPrimary group-hover:text-accent transition-colors line-clamp-2 leading-relaxed">
        {task.title}
      </h4>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.map((label, idx) => (
            <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-bgSecondary text-textMuted border border-borderColor">
              #{label}
            </span>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-borderColor/50 flex items-center justify-between text-xs text-textMuted">
        <div className="flex items-center gap-2.5">
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                isOverdue
                  ? 'text-danger bg-danger/10 border border-danger/20'
                  : 'text-textMuted bg-bgSecondary border border-borderColor'
              }`}
            >
              <Calendar size={11} />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
          {task.attachments?.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-mono">
              <Paperclip size={11} />
              {task.attachments.length}
            </span>
          )}
        </div>

        {task.assignee ? (
          <img
            src={task.assignee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignee.name)}&background=2563EB&color=fff`}
            alt={task.assignee.name}
            title={`Assigned to ${task.assignee.name}`}
            className="w-5 h-5 rounded-full ring-1 ring-accent/40 object-cover"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-bgSecondary flex items-center justify-center text-textMuted border border-borderColor" title="Unassigned">
            <User size={10} />
          </div>
        )}
      </div>
    </div>
  );
};
