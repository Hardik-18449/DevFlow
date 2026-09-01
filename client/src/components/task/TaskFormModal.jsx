import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useCreateTaskMutation, useGetProjectMembersQuery } from '../../services/api';
import { useToast } from '../ui/ToastContainer';

export const TaskFormModal = ({ isOpen, onClose, projectId, defaultStatus = 'TODO' }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState('MEDIUM');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: membersData } = useGetProjectMembersQuery(projectId, { skip: !projectId });
  const members = membersData?.data || [];
  const { addToast } = useToast();

  const [createTask, { isLoading }] = useCreateTaskMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length < 2) {
      setErrorMsg('Task title must be at least 2 characters long.');
      return;
    }

    try {
      await createTask({
        projectId,
        data: {
          title: trimmedTitle,
          description: description.trim(),
          status,
          priority,
          assignee: assignee || null,
          dueDate: dueDate || null,
          labels: labels ? labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
        },
      }).unwrap();

      setTitle('');
      setDescription('');
      setErrorMsg('');
      onClose();
      addToast({
        title: 'Task Created',
        message: 'New task added to project board successfully.',
        type: 'success',
      });
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to create task. Please check task details.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-center gap-2 font-medium">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        <div>
          <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
            Task Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Implement OAuth2 authentication flow"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-bgSecondary border border-borderColor rounded-xl text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Add task specifications and requirements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-bgSecondary border border-borderColor rounded-xl text-xs text-textPrimary focus:outline-none focus:border-accent resize-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-bgSecondary border border-borderColor rounded-xl text-xs text-textPrimary focus:outline-none focus:border-accent transition-colors"
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
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-bgSecondary border border-borderColor rounded-xl text-xs text-textPrimary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="LOW" className="bg-cardBg text-textPrimary">Low</option>
              <option value="MEDIUM" className="bg-cardBg text-textPrimary">Medium</option>
              <option value="HIGH" className="bg-cardBg text-textPrimary">High</option>
              <option value="URGENT" className="bg-cardBg text-textPrimary">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
              Assignee
            </label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 bg-bgSecondary border border-borderColor rounded-xl text-xs text-textPrimary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="" className="bg-cardBg text-textPrimary">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId._id} value={m.userId._id} className="bg-cardBg text-textPrimary">
                  {m.userId.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-bgSecondary border border-borderColor rounded-xl text-xs text-textPrimary focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
            Labels (comma separated)
          </label>
          <input
            type="text"
            placeholder="frontend, auth, bug"
            value={labels}
            onChange={(e) => setLabels(e.target.value)}
            className="w-full px-3 py-2 bg-bgSecondary border border-borderColor rounded-xl text-xs text-textPrimary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-borderColor">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-textSecondary hover:bg-bgSecondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-all shadow-subtle cursor-pointer"
          >
            {isLoading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
