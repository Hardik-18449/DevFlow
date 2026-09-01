import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Users, UserPlus, Building2, AlertCircle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useGetOrgMembersQuery, useInviteOrgMemberMutation } from '../services/api';

export const Settings = () => {
  const { user, currentOrganization } = useSelector((state) => state.auth);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [successMsg, setSuccessMsg] = useState('');
  const [createdInviteUrl, setCreatedInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: membersData } = useGetOrgMembersQuery(currentOrganization?._id, {
    skip: !currentOrganization?._id,
  });
  const members = membersData?.data || [];

  const [inviteOrgMember, { isLoading: isInviting }] = useInviteOrgMemberMutation();

  const handleInvite = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setCreatedInviteUrl('');

    const trimmedEmail = inviteEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      const res = await inviteOrgMember({
        orgId: currentOrganization._id,
        email: trimmedEmail,
        role: inviteRole,
      }).unwrap();

      const emailSent = res.data?.emailSent;
      const inviteToken = res.data?.inviteToken;
      const inviteUrl = (!emailSent && inviteToken) ? `${window.location.origin}/accept-invite?token=${inviteToken}` : '';

      setSuccessMsg(res.data?.message || `Invitation email successfully sent to ${trimmedEmail}`);
      if (inviteUrl) {
        setCreatedInviteUrl(inviteUrl);
      }
      setInviteEmail('');
      setIsInviteModalOpen(false);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to send invitation. Please check email address.');
    }
  };

  const copyToClipboard = () => {
    if (createdInviteUrl) {
      navigator.clipboard.writeText(createdInviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Organization & Team Settings</h1>
        <p className="text-xs text-textSecondary mt-1">Manage team members, roles, and invitation access</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-xs text-success space-y-2">
          <div className="font-semibold">{successMsg}</div>
          {createdInviteUrl && (
            <div className="flex items-center gap-2 pt-2 border-t border-success/20">
              <input
                type="text"
                readOnly
                value={createdInviteUrl}
                className="flex-1 px-3 py-1.5 bg-bgSecondary border border-borderColor rounded-lg text-xs font-mono text-textPrimary"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 bg-accent text-white font-semibold rounded-lg text-xs hover:bg-accent-hover transition-colors shrink-0"
              >
                {copied ? 'Copied Link!' : 'Copy Link'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Organization Info Box */}
      <div className="p-6 rounded-2xl bg-cardBg border border-borderColor flex items-center justify-between shadow-subtle">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <Building2 size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-textPrimary">{currentOrganization?.name}</h3>
            <p className="text-xs text-textSecondary mt-0.5">{currentOrganization?.description || 'Active Enterprise Workspace'}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setErrorMsg('');
            setIsInviteModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-all shadow-subtle flex items-center gap-2"
        >
          <UserPlus size={16} /> Invite Team Member
        </button>
      </div>

      {/* Team Roster Table */}
      <div className="bg-cardBg border border-borderColor rounded-2xl p-6 shadow-subtle">
        <h3 className="text-sm font-bold text-textPrimary mb-4 flex items-center gap-2">
          <Users size={16} className="text-accent" /> Team Roster ({members.length})
        </h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-borderColor text-textSecondary uppercase tracking-wider font-mono">
              <th className="pb-3 px-3">Member</th>
              <th className="pb-3 px-3">Role</th>
              <th className="pb-3 px-3">Status</th>
              <th className="pb-3 px-3">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borderColor/40">
            {members.map((m) => (
              <tr key={m._id} className="hover:bg-cardHover/60 transition-colors">
                <td className="py-3.5 px-3 flex items-center gap-3">
                  <img
                    src={m.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.userId?.name || 'User')}&background=2563EB&color=fff`}
                    alt={m.userId?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-semibold text-textPrimary block">{m.userId?.name}</span>
                    <span className="text-[11px] text-textSecondary">{m.userId?.email}</span>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider border ${
                      m.role === 'OWNER'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        : m.role === 'ADMIN'
                        ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                        : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                    }`}
                  >
                    {m.role}
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <span className="text-emerald-500 font-semibold">Active</span>
                </td>
                <td className="py-3.5 px-3 text-textSecondary">
                  {new Date(m.joinedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invitation Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Team Member">
        <form onSubmit={handleInvite} noValidate className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
              Email Address *
            </label>
            <input
              type="text"
              placeholder="developer@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className={`w-full px-3 py-2 bg-bgSecondary border ${
                errorMsg && !inviteEmail.trim() ? 'border-danger' : 'border-borderColor'
              } rounded-xl text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors`}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
              Organization Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3 py-2 bg-bgSecondary border border-borderColor rounded-xl text-xs text-textPrimary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="MEMBER" className="bg-cardBg text-textPrimary">Member (Can create tasks & comments)</option>
              <option value="ADMIN" className="bg-cardBg text-textPrimary">Admin (Can manage projects & members)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-borderColor">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-textSecondary hover:bg-bgSecondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isInviting}
              className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-all shadow-subtle"
            >
              {isInviting ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
