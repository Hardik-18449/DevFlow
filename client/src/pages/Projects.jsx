import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Search, AlertCircle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { useGetProjectsQuery, useCreateProjectMutation, useGetOrganizationsQuery } from '../services/api';
import { setCurrentOrganization } from '../features/auth/authSlice';

export const Projects = () => {
  const dispatch = useDispatch();
  const { currentOrganization } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('HIGH');
  const [search, setSearch] = useState('');
  const [createError, setCreateError] = useState('');

  const { data: orgsData } = useGetOrganizationsQuery();
  const organizations = orgsData?.data || [];
  const activeOrg = currentOrganization || organizations[0];

  useEffect(() => {
    if (!currentOrganization && organizations.length > 0) {
      dispatch(setCurrentOrganization(organizations[0]));
    }
  }, [currentOrganization, organizations, dispatch]);

  const { data: projectsData, isLoading } = useGetProjectsQuery(
    { orgId: activeOrg?._id, search },
    { skip: !activeOrg?._id }
  );
  const projects = projectsData?.data || [];

  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');

    const targetOrgId = activeOrg?._id;
    const trimmedName = name.trim();
    const trimmedKey = key.trim().toUpperCase();
    const trimmedDesc = description.trim();

    if (!targetOrgId) {
      setCreateError('No organization selected. Please create or join an organization first.');
      return;
    }

    if (!trimmedName || trimmedName.length < 2) {
      setCreateError('Project name must be at least 2 characters long.');
      return;
    }

    if (!trimmedKey || !/^[A-Z0-9]{2,10}$/.test(trimmedKey)) {
      setCreateError('Project key must be 2-10 uppercase letters or numbers (e.g. CORE).');
      return;
    }

    try {
      const res = await createProject({
        orgId: targetOrgId,
        data: { name: trimmedName, key: trimmedKey, description: trimmedDesc, priority },
      }).unwrap();

      setName('');
      setKey('');
      setDescription('');
      setIsModalOpen(false);

      if (res?.data?._id) {
        navigate(`/projects/${res.data._id}`);
      }
    } catch (err) {
      setCreateError(err.data?.message || 'Failed to create project. Please verify inputs.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderColor pb-4">
        <div>
          <h1 className="text-xl font-bold text-textPrimary tracking-tight">Projects</h1>
          <p className="text-xs text-textSecondary mt-0.5">
            Active workspaces for {activeOrg?.name || 'organization'}
          </p>
        </div>
        <button
          onClick={() => {
            setCreateError('');
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-lg bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-all flex items-center gap-2 self-start sm:self-auto shadow-subtle cursor-pointer"
        >
          <Plus size={15} /> Create Project
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-2.5 text-textSecondary" />
          <input
            type="text"
            placeholder="Filter projects by name or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-cardBg border border-borderColor rounded-lg text-xs text-textPrimary placeholder-textSecondary focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-xs text-textSecondary">
            Loading workspace projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full p-12 border border-dashed border-borderColor rounded-xl text-center text-xs text-textSecondary">
            No active projects found. Click "Create Project" to get started.
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="p-5 rounded-xl bg-cardBg border border-borderColor hover:border-accent/50 transition-all cursor-pointer group flex flex-col justify-between hover:bg-cardHover shadow-subtle"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded bg-accent/10 text-accent font-mono text-xs font-bold border border-accent/20">
                    {project.key}
                  </span>
                  <PriorityBadge priority={project.priority} />
                </div>
                <h3 className="text-sm font-bold text-textPrimary group-hover:text-accent transition-colors">
                  {project.name}
                </h3>
                <p className="mt-1.5 text-xs text-textSecondary line-clamp-2 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-borderColor/50 flex items-center justify-between text-xs text-textSecondary">
                <StatusBadge status={project.status} />
                <span className="text-accent font-semibold text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Board <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Software Project">
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{createError}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Core Engine API"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!key) setKey(e.target.value.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, ''));
              }}
              className="w-full px-3 py-2 bg-bgSecondary border border-borderColor rounded-lg text-xs text-textPrimary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1">
              Project Key Prefix *
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="ENG"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              className="w-full px-3 py-2 bg-bgSecondary border border-borderColor rounded-lg text-xs text-textPrimary font-mono uppercase focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Project goals and sprint scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-bgSecondary border border-borderColor rounded-lg text-xs text-textPrimary focus:outline-none focus:border-accent resize-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-bgSecondary border border-borderColor rounded-lg text-xs text-textPrimary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="LOW" className="bg-cardBg text-textPrimary">Low</option>
              <option value="MEDIUM" className="bg-cardBg text-textPrimary">Medium</option>
              <option value="HIGH" className="bg-cardBg text-textPrimary">High</option>
              <option value="URGENT" className="bg-cardBg text-textPrimary">Urgent</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-borderColor">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-textSecondary hover:bg-bgSecondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-all shadow-subtle cursor-pointer"
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
