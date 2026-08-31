import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Kanban,
  List,
  Activity,
  BarChart3,
  Users,
  Plus,
  Search,
  UserPlus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { KanbanBoard } from '../components/task/KanbanBoard';
import { TaskDrawer } from '../components/task/TaskDrawer';
import { TaskFormModal } from '../components/task/TaskFormModal';
import { Modal } from '../components/ui/Modal';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import {
  useGetProjectQuery,
  useGetTasksQuery,
  useGetProjectActivitiesQuery,
  useGetProjectDashboardQuery,
  useGetProjectMembersQuery,
  useGetOrgMembersQuery,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
} from '../services/api';
import { getSocket } from '../sockets/socket';
import { useDispatch } from 'react-redux';
import { api } from '../services/api';

export const ProjectDetails = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'list' | 'activity' | 'analytics' | 'members'
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedProjectRole, setSelectedProjectRole] = useState('DEVELOPER');
  const [addMemberError, setAddMemberError] = useState('');

  const [defaultTaskStatus, setDefaultTaskStatus] = useState('TODO');
  const [taskSearch, setTaskSearch] = useState('');

  const { data: projectData } = useGetProjectQuery(projectId);
  const project = projectData?.data;

  const { data: tasksData } = useGetTasksQuery({ projectId, search: taskSearch });
  const tasks = tasksData?.data || [];

  const { data: activityData } = useGetProjectActivitiesQuery(projectId);
  const activities = activityData?.data || [];

  const { data: dashboardData } = useGetProjectDashboardQuery(projectId);
  const dashboard = dashboardData?.data;

  const { data: membersData } = useGetProjectMembersQuery(projectId);
  const projectMembers = membersData?.data || [];

  const { data: orgMembersData } = useGetOrgMembersQuery(project?.organizationId, {
    skip: !project?.organizationId,
  });
  const orgMembers = orgMembersData?.data || [];

  const [addProjectMember, { isLoading: isAddingMember }] = useAddProjectMemberMutation();
  const [removeProjectMember] = useRemoveProjectMemberMutation();

  // Filter out org members who are already in the project
  const availableOrgMembers = orgMembers.filter(
    (om) => !projectMembers.some((pm) => pm.userId?._id === om.userId?._id)
  );

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setAddMemberError('');

    try {
      await addProjectMember({
        projectId,
        userId: selectedUserId,
        role: selectedProjectRole,
      }).unwrap();

      setSelectedUserId('');
      setIsAddMemberModalOpen(false);
    } catch (err) {
      setAddMemberError(err.data?.message || 'Failed to add member to project.');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member from the project?')) {
      try {
        await removeProjectMember({ projectId, userId }).unwrap();
      } catch (err) {
        alert(err.data?.message || 'Failed to remove project member');
      }
    }
  };

  // Real-time Socket listener setup for project room
  useEffect(() => {
    const socket = getSocket();
    if (socket && projectId) {
      socket.emit('project.join', { projectId });

      socket.on('task.updated', () => {
        dispatch(api.util.invalidateTags(['Task', 'Project']));
      });
      socket.on('task.created', () => {
        dispatch(api.util.invalidateTags(['Task', 'Project']));
      });
      socket.on('task.deleted', () => {
        dispatch(api.util.invalidateTags(['Task', 'Project']));
      });
      socket.on('comment.created', () => {
        dispatch(api.util.invalidateTags(['Comment', 'Activity']));
      });
      socket.on('activity.created', () => {
        dispatch(api.util.invalidateTags(['Activity']));
      });

      return () => {
        socket.emit('project.leave', { projectId });
        socket.off('task.updated');
        socket.off('task.created');
        socket.off('task.deleted');
        socket.off('comment.created');
        socket.off('activity.created');
      };
    }
  }, [projectId, dispatch]);

  if (!project) return <div className="p-8 text-textSecondary text-xs">Loading project details...</div>;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4 animate-fade-in">
      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderColor pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-textPrimary tracking-tight">{project.name}</h1>
            <span className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent font-mono text-xs font-bold border border-accent/20">
              #{project.key}
            </span>
            <PriorityBadge priority={project.priority} />
          </div>
          <p className="text-xs text-textSecondary mt-1">{project.description || 'Project Workspace'}</p>
        </div>

        <button
          onClick={() => {
            setDefaultTaskStatus('TODO');
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-all shadow-subtle flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center justify-between border-b border-borderColor">
        <div className="flex items-center gap-1">
          {[
            { id: 'board', label: 'Board', icon: Kanban },
            { id: 'list', label: 'Tasks List', icon: List },
            { id: 'activity', label: 'Activity Feed', icon: Activity },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'members', label: 'Members', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-textSecondary hover:text-textPrimary'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter Input */}
        <div className="relative w-64 hidden md:block pb-2">
          <Search size={14} className="absolute left-3 top-2.5 text-textSecondary" />
          <input
            type="text"
            placeholder="Filter tasks..."
            value={taskSearch}
            onChange={(e) => setTaskSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-cardBg border border-borderColor rounded-lg text-xs text-textPrimary focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Tab Views Content */}
      <div className="flex-1 min-h-0 overflow-hidden pt-2">
        {/* Tab 1: Kanban Board */}
        {activeTab === 'board' && (
          <KanbanBoard
            tasks={tasks}
            onTaskClick={(task) => setSelectedTask(task)}
            onAddTask={(status) => {
              setDefaultTaskStatus(status);
              setIsCreateModalOpen(true);
            }}
          />
        )}

        {/* Tab 2: List View */}
        {activeTab === 'list' && (
          <div className="h-full overflow-y-auto bg-cardBg border border-borderColor rounded-2xl p-4 shadow-subtle">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderColor text-textSecondary uppercase tracking-wider font-mono">
                  <th className="pb-3 px-3">Key</th>
                  <th className="pb-3 px-3">Title</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Priority</th>
                  <th className="pb-3 px-3">Assignee</th>
                  <th className="pb-3 px-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor/40">
                {tasks.map((task) => (
                  <tr
                    key={task._id}
                    onClick={() => setSelectedTask(task)}
                    className="hover:bg-cardHover cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-semibold text-accent">{task.taskKey}</td>
                    <td className="py-3 px-3 font-semibold text-textPrimary">{task.title}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="py-3 px-3">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="py-3 px-3">
                      {task.assignee?.name || <span className="text-textSecondary italic">Unassigned</span>}
                    </td>
                    <td className="py-3 px-3 text-textSecondary">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Timeline & Activity Feed */}
        {activeTab === 'activity' && (
          <div className="h-full overflow-y-auto bg-cardBg border border-borderColor rounded-2xl p-6 space-y-4 shadow-subtle">
            <h3 className="text-sm font-bold text-textPrimary">Project Activity Stream</h3>
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act._id} className="p-4 rounded-xl bg-bgSecondary/40 border border-borderColor flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={act.actorId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(act.actorId?.name || 'User')}&background=2563EB&color=fff`}
                      alt={act.actorId?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-textPrimary">
                        <span className="font-semibold">{act.actorId?.name}</span> {act.action}
                      </p>
                      <span className="text-[10px] text-textSecondary font-mono">{act.metadata?.taskKey}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-textSecondary">{new Date(act.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Analytics */}
        {activeTab === 'analytics' && dashboard && (
          <div className="h-full overflow-y-auto space-y-6 p-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-cardBg border border-borderColor text-center shadow-subtle">
                <span className="text-2xl font-bold font-mono text-textPrimary">{dashboard.totalTasks}</span>
                <span className="block text-xs text-textSecondary mt-1">Total Tasks</span>
              </div>
              <div className="p-4 rounded-xl bg-cardBg border border-borderColor text-center shadow-subtle">
                <span className="text-2xl font-bold font-mono text-emerald-500">{dashboard.completedTasks}</span>
                <span className="block text-xs text-textSecondary mt-1">Completed</span>
              </div>
              <div className="p-4 rounded-xl bg-cardBg border border-borderColor text-center shadow-subtle">
                <span className="text-2xl font-bold font-mono text-amber-500">{dashboard.inProgressTasks}</span>
                <span className="block text-xs text-textSecondary mt-1">In Progress</span>
              </div>
              <div className="p-4 rounded-xl bg-cardBg border border-borderColor text-center shadow-subtle">
                <span className="text-2xl font-bold font-mono text-accent">{dashboard.completionPercentage}%</span>
                <span className="block text-xs text-textSecondary mt-1">Completion Rate</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Members */}
        {activeTab === 'members' && (
          <div className="h-full overflow-y-auto bg-cardBg border border-borderColor rounded-2xl p-6 space-y-6 shadow-subtle">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-textPrimary">Project Roster & Roles</h3>
                <p className="text-xs text-textSecondary mt-0.5">Manage team members assigned to this project board</p>
              </div>
              <button
                onClick={() => {
                  setAddMemberError('');
                  setIsAddMemberModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-all shadow-subtle flex items-center gap-2"
              >
                <UserPlus size={16} /> Add Member to Project
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projectMembers.map((m) => (
                <div key={m._id} className="p-4 rounded-xl bg-bgSecondary/60 border border-borderColor flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.userId?.name || 'User')}&background=2563EB&color=fff`}
                      alt={m.userId?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-textPrimary">{m.userId?.name}</h4>
                      <p className="text-xs text-textSecondary">{m.userId?.email}</p>
                      <span className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-accent/10 text-accent font-mono uppercase">
                        {m.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(m.userId?._id)}
                    className="p-2 text-textSecondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    title="Remove member"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Details Drawer */}
      {selectedTask && (
        <TaskDrawer taskId={selectedTask._id} onClose={() => setSelectedTask(null)} />
      )}

      {/* Create Task Modal */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        defaultStatus={defaultTaskStatus}
      />

      {/* Add Member to Project Modal */}
      <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title="Add Member to Project">
        <form onSubmit={handleAddMember} className="space-y-4">
          {addMemberError && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{addMemberError}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
              Select Team Member *
            </label>
            <select
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 bg-bgSecondary border border-borderColor rounded-xl text-xs text-textPrimary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="" className="bg-cardBg text-textPrimary">-- Choose Organization Member --</option>
              {availableOrgMembers.map((om) => (
                <option key={om.userId?._id} value={om.userId?._id} className="bg-cardBg text-textPrimary">
                  {om.userId?.name} ({om.userId?.email})
                </option>
              ))}
            </select>
            {availableOrgMembers.length === 0 && (
              <p className="text-[11px] text-textSecondary mt-1 italic">
                All organization members are already added to this project.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
              Project Role
            </label>
            <select
              value={selectedProjectRole}
              onChange={(e) => setSelectedProjectRole(e.target.value)}
              className="w-full px-3 py-2 bg-bgSecondary border border-borderColor rounded-xl text-xs text-textPrimary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="DEVELOPER" className="bg-cardBg text-textPrimary">Developer (Full edit access to tasks)</option>
              <option value="PROJECT_MANAGER" className="bg-cardBg text-textPrimary">Project Manager (Can manage board & members)</option>
              <option value="VIEWER" className="bg-cardBg text-textPrimary">Viewer (Read-only access)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-borderColor">
            <button
              type="button"
              onClick={() => setIsAddMemberModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-textSecondary hover:bg-bgSecondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingMember || !selectedUserId}
              className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-all shadow-subtle"
            >
              {isAddingMember ? 'Adding...' : 'Add to Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
