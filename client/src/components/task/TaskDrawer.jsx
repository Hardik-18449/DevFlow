import React, { useState } from 'react';
import { X, Send, Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import {
  useGetTaskQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useGetProjectMembersQuery,
} from '../../services/api';

export const TaskDrawer = ({ taskId, onClose }) => {
  const [commentText, setCommentText] = useState('');
  const { data: taskData, isLoading } = useGetTaskQuery(taskId, { skip: !taskId });
  const { data: commentsData } = useGetCommentsQuery(taskId, { skip: !taskId });
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [createComment] = useCreateCommentMutation();

  const task = taskData?.data;
  const comments = commentsData?.data || [];

  const { data: membersData } = useGetProjectMembersQuery(task?.projectId, { skip: !task?.projectId });
  const projectMembers = membersData?.data || [];

  if (!taskId || isLoading || !task) return null;

  const handleStatusChange = async (e) => {
    await updateTask({ taskId, data: { status: e.target.value } });
  };

  const handlePriorityChange = async (e) => {
    await updateTask({ taskId, data: { priority: e.target.value } });
  };

  const handleAssigneeChange = async (e) => {
    await updateTask({ taskId, data: { assignee: e.target.value || null } });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await createComment({ taskId, content: commentText });
    setCommentText('');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-cardBg border-l border-borderColor h-full flex flex-col shadow-elevated overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 border-b border-borderColor bg-bgSecondary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20">
              {task.taskKey}
            </span>
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-danger hover:bg-danger/10 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-textPrimary">{task.title}</h2>
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-bgSecondary border border-borderColor text-xs">
            <div>
              <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block mb-1">Status</label>
              <select
                value={task.status}
                onChange={handleStatusChange}
                className="w-full bg-cardBg border border-borderColor rounded-lg py-1 px-2 text-textPrimary focus:outline-none focus:border-accent transition-colors"
              >
                <option value="BACKLOG" className="bg-cardBg text-textPrimary">Backlog</option>
                <option value="TODO" className="bg-cardBg text-textPrimary">To Do</option>
                <option value="IN_PROGRESS" className="bg-cardBg text-textPrimary">In Progress</option>
                <option value="IN_REVIEW" className="bg-cardBg text-textPrimary">In Review</option>
                <option value="BLOCKED" className="bg-cardBg text-textPrimary">Blocked</option>
                <option value="DONE" className="bg-cardBg text-textPrimary">Done</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block mb-1">Priority</label>
              <select
                value={task.priority}
                onChange={handlePriorityChange}
                className="w-full bg-cardBg border border-borderColor rounded-lg py-1 px-2 text-textPrimary focus:outline-none focus:border-accent transition-colors"
              >
                <option value="LOW" className="bg-cardBg text-textPrimary">Low</option>
                <option value="MEDIUM" className="bg-cardBg text-textPrimary">Medium</option>
                <option value="HIGH" className="bg-cardBg text-textPrimary">High</option>
                <option value="URGENT" className="bg-cardBg text-textPrimary">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block mb-1">Assignee</label>
              <select
                value={task.assignee?._id || ''}
                onChange={handleAssigneeChange}
                className="w-full bg-cardBg border border-borderColor rounded-lg py-1 px-2 text-textPrimary focus:outline-none focus:border-accent transition-colors"
              >
                <option value="" className="bg-cardBg text-textPrimary">Unassigned</option>
                {projectMembers.map((m) => (
                  <option key={m.userId._id} value={m.userId._id} className="bg-cardBg text-textPrimary">
                    {m.userId.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Description</h4>
            <div className="p-4 rounded-xl bg-bgSecondary/60 border border-borderColor text-sm text-textPrimary leading-relaxed whitespace-pre-wrap">
              {task.description || <span className="italic text-textSecondary">No description provided.</span>}
            </div>
          </div>

          {/* Labels & Details */}
          <div className="flex flex-wrap gap-4 text-xs text-textSecondary">
            {task.dueDate && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-accent" />
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            {task.estimatedHours > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-accent" />
                <span>Est: {task.estimatedHours} hrs</span>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="pt-4 border-t border-borderColor">
            <h4 className="text-sm font-bold text-textPrimary flex items-center gap-2 mb-4">
              <MessageSquare size={16} className="text-accent" /> Comments ({comments.length})
            </h4>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="relative">
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-3 rounded-xl bg-bgSecondary border border-borderColor text-xs text-textPrimary placeholder-textSecondary focus:outline-none focus:border-accent resize-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover disabled:opacity-50 transition-all flex items-center gap-1 shadow-subtle"
                >
                  <Send size={12} /> Post
                </button>
              </div>
            </form>

            {/* Comments Stream */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="p-3 rounded-xl bg-bgSecondary/40 border border-borderColor flex gap-3">
                  <img
                    src={comment.authorId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorId?.name || 'User')}&background=2563EB&color=fff`}
                    alt={comment.authorId?.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-borderColor"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-textPrimary">{comment.authorId?.name}</span>
                      <span className="text-[10px] text-textSecondary">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-textPrimary leading-normal">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
