import React from 'react';
import { useSelector } from 'react-redux';
import { StatCard } from '../components/ui/StatCard';
import { FolderKanban, CheckCircle2, Clock, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import {
  useGetProjectsQuery,
  useGetTasksQuery,
  useGetProjectActivitiesQuery,
} from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Dashboard = () => {
  const { user, currentOrganization } = useSelector((state) => state.auth);

  const { data: projectsData } = useGetProjectsQuery(
    { orgId: currentOrganization?._id },
    { skip: !currentOrganization?._id }
  );
  const projects = projectsData?.data || [];

  const activeProject = projects[0];
  const { data: tasksData } = useGetTasksQuery(
    { projectId: activeProject?._id },
    { skip: !activeProject?._id }
  );
  const tasks = tasksData?.data || [];

  const { data: activityData } = useGetProjectActivitiesQuery(activeProject?._id, {
    skip: !activeProject?._id,
  });
  const activities = activityData?.data || [];

  const totalProjects = projects.length;
  const openTasks = tasks.filter((t) => t.status !== 'DONE').length;
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
  ).length;

  const statusData = [
    { name: 'To Do', value: tasks.filter((t) => t.status === 'TODO').length, color: '#38BDF8' },
    { name: 'In Progress', value: tasks.filter((t) => t.status === 'IN_PROGRESS').length, color: '#F59E0B' },
    { name: 'In Review', value: tasks.filter((t) => t.status === 'IN_REVIEW').length, color: '#A855F7' },
    { name: 'Done', value: completedTasks, color: '#10B981' },
  ];

  const velocityData = [
    { day: 'Mon', completed: 4 },
    { day: 'Tue', completed: 7 },
    { day: 'Wed', completed: 12 },
    { day: 'Thu', completed: 9 },
    { day: 'Fri', completed: 15 },
    { day: 'Sat', completed: 3 },
    { day: 'Sun', completed: 5 },
  ];

  const customTooltipStyle = {
    backgroundColor: 'var(--card-bg)',
    borderColor: 'var(--border-color)',
    borderRadius: '8px',
    fontSize: '11px',
    color: 'var(--text-primary)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="border-b border-borderColor pb-4">
        <h1 className="text-xl font-bold text-textPrimary tracking-tight">
          System Overview & Analytics
        </h1>
        <p className="text-xs text-textSecondary mt-0.5">
          Metrics for {currentOrganization?.name || 'organization workspace'}
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Projects" value={totalProjects} icon={FolderKanban} change="12%" subtitle="Active workspaces" />
        <StatCard title="Open Tasks" value={openTasks} icon={Clock} subtitle="Pending resolution" />
        <StatCard title="Completed Tasks" value={completedTasks} icon={CheckCircle2} change="24%" subtitle="Resolved this cycle" />
        <StatCard title="Overdue Tasks" value={overdueTasks} icon={AlertTriangle} subtitle="Action required" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Completion Velocity Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-cardBg border border-borderColor shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={14} className="text-accent" /> Completion Velocity
              </h3>
              <p className="text-[11px] text-textSecondary mt-0.5">Tasks completed per day</p>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData}>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="completed" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Distribution Donut Chart */}
        <div className="p-5 rounded-xl bg-cardBg border border-borderColor shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider mb-0.5">Status Distribution</h3>
            <p className="text-[11px] text-textSecondary mb-3">Task breakdown by stage</p>
          </div>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={45} outerRadius={68} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={customTooltipStyle}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-borderColor text-xs">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-textSecondary text-[11px]">{item.name}:</span>
                <span className="font-semibold text-textPrimary font-mono text-[11px]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline Feed */}
      <div className="p-5 rounded-xl bg-cardBg border border-borderColor shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
            <Activity size={14} className="text-accent" /> System Audit Stream
          </h3>
        </div>
        <div className="space-y-2">
          {activities.length === 0 ? (
            <p className="text-xs text-textSecondary">No recent audit log activities recorded.</p>
          ) : (
            activities.slice(0, 5).map((act) => (
              <div key={act._id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-bgSecondary border border-borderColor text-xs">
                <img
                  src={act.actorId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(act.actorId?.name || 'User')}&background=2563EB&color=fff`}
                  alt={act.actorId?.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-borderColor mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-textPrimary font-medium text-[11px]">
                    <span className="font-bold">{act.actorId?.name}</span> {act.action}
                  </p>
                  <span className="text-[10px] text-textSecondary font-mono mt-0.5 block">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
