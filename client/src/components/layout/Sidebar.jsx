import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Zap,
  Building2,
} from 'lucide-react';
import { useGetOrganizationsQuery, useGetProjectsQuery } from '../../services/api';
import { setCurrentOrganization } from '../../features/auth/authSlice';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { currentOrganization } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: orgsData } = useGetOrganizationsQuery();
  const organizations = orgsData?.data || [];

  React.useEffect(() => {
    if (organizations.length > 0 && (!currentOrganization || !organizations.some((o) => o._id === currentOrganization._id))) {
      dispatch(setCurrentOrganization(organizations[0]));
    }
  }, [organizations, currentOrganization, dispatch]);

  const { data: projectsData } = useGetProjectsQuery(
    { orgId: currentOrganization?._id },
    { skip: !currentOrganization?._id }
  );
  const projects = projectsData?.data || [];

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, kbd: 'G D' },
    { label: 'Projects', path: '/projects', icon: FolderKanban, kbd: 'G P' },
    { label: 'Team & Settings', path: '/settings', icon: Users, kbd: 'G S' },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-bgSecondary border-r border-borderColor flex flex-col transition-all duration-300 z-40 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-borderColor">
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white shadow-subtle group-hover:scale-105 transition-transform">
            <Zap size={18} className="fill-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-textPrimary tracking-tight font-sans">DevFlow</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cardBg text-textMuted border border-borderColor">v1.0</span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg text-textMuted hover:text-textPrimary hover:bg-cardBg transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Organization Switcher */}
      {!collapsed && (
        <div className="p-3 border-b border-borderColor bg-bgPrimary/40">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Workspace</span>
          </div>
          <div className="relative">
            <select
              value={currentOrganization?._id || ''}
              onChange={(e) => {
                const selected = organizations.find((o) => o._id === e.target.value);
                if (selected) dispatch(setCurrentOrganization(selected));
              }}
              className="w-full bg-cardBg border border-borderColor rounded-lg py-1.5 px-2.5 text-xs font-semibold text-textPrimary focus:outline-none focus:border-accent/60 cursor-pointer transition-colors"
            >
              {organizations.map((org) => (
                <option key={org._id} value={org._id} className="bg-cardBg text-textPrimary">
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-accent/15 text-accent border border-accent/25 shadow-subtle'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-cardHover border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? 'text-accent' : 'text-textMuted'} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && item.kbd && (
                  <span className="kbd-badge">{item.kbd}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Projects List Section */}
        {!collapsed && (
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Active Projects</span>
              <button
                onClick={() => navigate('/projects')}
                className="text-textMuted hover:text-accent p-0.5 rounded transition-colors"
                title="Create Project"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-0.5">
              {projects.slice(0, 6).map((project) => {
                const isActive = location.pathname === `/projects/${project._id}`;
                return (
                  <button
                    key={project._id}
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-cardHover text-textPrimary font-semibold border border-borderColor'
                        : 'text-textSecondary hover:text-textPrimary hover:bg-cardHover/60 border border-transparent'
                    }`}
                  >
                    <span className="truncate">{project.name}</span>
                    <span className="font-mono text-[9px] text-textMuted px-1.5 py-0.5 rounded bg-bgPrimary border border-borderColor">
                      {project.key}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Profile summary when collapsed */}
      {collapsed && (
        <div className="p-3 border-t border-borderColor flex justify-center">
          <Building2 size={18} className="text-textMuted" />
        </div>
      )}
    </aside>
  );
};
