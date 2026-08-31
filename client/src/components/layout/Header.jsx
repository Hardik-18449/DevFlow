import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Check, User, LogOut, ChevronDown, CheckCheck, FolderKanban, CheckSquare, Sparkles, Sun, Moon } from 'lucide-react';
import { logout } from '../../features/auth/authSlice';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useLazySearchQuery,
} from '../../services/api';

export const Header = () => {
  const { user, currentOrganization } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('devflow_theme');
    if (saved) return saved === 'dark';
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('devflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('devflow_theme', 'light');
    }
  }, [isDark]);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const { data: notifData } = useGetNotificationsQuery(undefined, {
    pollingInterval: 15000,
  });
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [triggerSearch] = useLazySearchQuery();

  const notifications = notifData?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'UNREAD') return !n.isRead;
    return true;
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 1) {
      const res = await triggerSearch({ q: val, orgId: currentOrganization?._id });
      setSearchResults(res.data?.data);
    } else {
      setSearchResults(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-14 border-b border-borderColor bg-bgSecondary/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm gap-3">
      {/* Global Command Search Bar */}
      <div className="relative flex-1 max-w-xs sm:max-w-md">
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3 text-textMuted" />
          <input
            type="text"
            placeholder="Search projects, tasks, keys... (⌘K)"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-9 pr-12 py-1.5 bg-cardBg border border-borderColor rounded-lg text-xs text-textPrimary placeholder-textMuted focus:outline-none focus:border-accent/60 transition-all font-sans"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <span className="kbd-badge">⌘K</span>
          </div>
        </div>

        {/* Raycast-Style Command Search Results Dropdown */}
        {searchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-dropdown rounded-xl p-3 z-50 max-h-96 overflow-y-auto animate-slide-down">
            {searchResults.tasks?.length > 0 && (
              <div className="mb-3">
                <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block mb-1.5 px-2 flex items-center gap-1.5">
                  <CheckSquare size={12} className="text-accent" /> Tasks
                </span>
                {searchResults.tasks.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => {
                      setSearchResults(null);
                      setSearchQuery('');
                      navigate(`/projects/${t.projectId?._id || t.projectId}`);
                    }}
                    className="p-2.5 rounded-lg hover:bg-cardHover cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-accent px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20">
                        {t.taskKey}
                      </span>
                      <span className="text-xs font-medium text-textPrimary">{t.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {searchResults.projects?.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block mb-1.5 px-2 flex items-center gap-1.5">
                  <FolderKanban size={12} className="text-accent" /> Projects
                </span>
                {searchResults.projects.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => {
                      setSearchResults(null);
                      setSearchQuery('');
                      navigate(`/projects/${p._id}`);
                    }}
                    className="p-2.5 rounded-lg hover:bg-cardHover cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <span className="text-xs font-semibold text-textPrimary">{p.name}</span>
                    <span className="text-[10px] font-mono text-textMuted bg-white/5 px-2 py-0.5 rounded">{p.key}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-cardBg border border-transparent hover:border-borderColor transition-all"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Workspace indicator */}
        {currentOrganization && (
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cardBg border border-borderColor text-xs font-medium text-textSecondary">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-textPrimary font-semibold">{currentOrganization.name}</span>
          </div>
        )}

        {/* Real-time Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-cardBg border border-transparent hover:border-borderColor transition-all relative"
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent ring-4 ring-bgSecondary animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-[320px] sm:w-[340px] glass-dropdown rounded-xl z-50 overflow-hidden animate-slide-down shadow-2xl">
              {/* Header Bar */}
              <div className="p-3 border-b border-borderColor flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-textPrimary tracking-tight">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-mono text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-borderColor text-[11px] font-semibold bg-bgSecondary/40">
                <button
                  onClick={() => setNotifFilter('ALL')}
                  className={`flex-1 py-1.5 text-center transition-colors border-b-2 ${
                    notifFilter === 'ALL'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-textMuted hover:text-textPrimary'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('UNREAD')}
                  className={`flex-1 py-1.5 text-center transition-colors border-b-2 ${
                    notifFilter === 'UNREAD'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-textMuted hover:text-textPrimary'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-borderColor/40">
                {filteredNotifications.length === 0 ? (
                  <p className="p-6 text-xs text-textMuted text-center">No notifications found.</p>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 text-xs transition-colors ${
                        n.isRead ? 'bg-cardBg/40 text-textSecondary' : 'bg-accent/5 text-textPrimary'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-textPrimary text-[12px] leading-tight">{n.title}</p>
                        <span className="text-[9px] font-mono text-textMuted shrink-0">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-textSecondary leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-cardBg border border-transparent hover:border-borderColor transition-all"
          >
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366F1&color=fff`}
              alt={user?.name}
              className="w-7 h-7 rounded-md object-cover ring-1 ring-white/10"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-textPrimary leading-none">{user?.name}</p>
            </div>
            <ChevronDown size={13} className="text-textMuted" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 glass-dropdown rounded-xl py-1 z-50 animate-slide-down">
              <div className="px-3.5 py-2.5 border-b border-borderColor">
                <p className="text-xs font-bold text-textPrimary">{user?.name}</p>
                <p className="text-[10px] text-textMuted truncate font-mono mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full px-3.5 py-2 text-xs font-medium text-textSecondary hover:text-textPrimary hover:bg-cardHover flex items-center gap-2 text-left transition-colors"
              >
                <User size={14} /> Profile & Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-3.5 py-2 text-xs font-medium text-danger hover:bg-danger/10 flex items-center gap-2 text-left transition-colors"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
