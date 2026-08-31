import React, { useState } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { useUpdateTaskStatusMutation } from '../../services/api';
import { useToast } from '../ui/ToastContainer';

const COLUMNS = [
  { id: 'BACKLOG', title: 'BACKLOG', color: 'border-slate-400/40' },
  { id: 'TODO', title: 'TO DO', color: 'border-blue-500/40' },
  { id: 'IN_PROGRESS', title: 'IN PROGRESS', color: 'border-amber-500/40' },
  { id: 'IN_REVIEW', title: 'IN REVIEW', color: 'border-purple-500/40' },
  { id: 'DONE', title: 'DONE', color: 'border-emerald-500/40' },
];

const KanbanColumn = ({ column, tasks, onTaskClick, onAddTask }) => {
  const taskIds = tasks.map((t) => t._id);

  return (
    <div className="flex-1 min-w-[280px] bg-bgSecondary/60 rounded-2xl border border-borderColor p-4 flex flex-col h-full min-h-[600px] shadow-subtle">
      <div className={`flex items-center justify-between pb-3 mb-3 border-b-2 ${column.color}`}>
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider font-mono">
            {column.title}
          </h3>
          <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-cardBg text-textSecondary border border-borderColor">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-cardBg transition-colors cursor-pointer"
          title="Add Task"
        >
          <Plus size={16} />
        </button>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={onTaskClick} />
          ))}
          {tasks.length === 0 && (
            <div className="h-32 border-2 border-dashed border-borderColor/50 rounded-xl flex items-center justify-center text-xs text-textMuted font-medium">
              No tasks in {column.title}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export const KanbanBoard = ({ tasks = [], onTaskClick, onAddTask }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const { addToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    let targetColumnId = null;

    if (COLUMNS.some((col) => col.id === over.id)) {
      targetColumnId = over.id;
    } else {
      const overTask = tasks.find((t) => t._id === over.id);
      if (overTask) targetColumnId = overTask.status;
    }

    if (targetColumnId && targetColumnId !== task.status) {
      try {
        await updateTaskStatus({ taskId, status: targetColumnId }).unwrap();
      } catch (err) {
        addToast({
          title: 'Action Restricted',
          message: err.data?.message || 'You do not have permission to update task status in this project.',
          type: 'warning',
        });
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {COLUMNS.map((column) => {
          const colTasks = tasks.filter((t) => t.status === column.id);
          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={colTasks}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
