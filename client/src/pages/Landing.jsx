import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Zap,
  ArrowRight,
  Kanban,
  ShieldCheck,
  Activity,
  Sparkles,
  Sun,
  Moon,
  Crown,
  Code2,
  Palette,
  Layers,
  Clock,
  Lock,
  Menu,
  X,
} from 'lucide-react';
import { useLoginMutation } from '../services/api';
import { setCredentials } from '../features/auth/authSlice';

export const Landing = () => {
  const { accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login] = useLoginMutation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('devflow_theme') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('devflow_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleDemoLogin = async (roleEmail) => {
    try {
      const res = await login({ email: roleEmail, password: 'Password123!' }).unwrap();
      if (res.success) {
        dispatch(
          setCredentials({
            user: res.data.user,
            tokens: res.data.tokens,
            organization: res.data.organization,
          })
        );
        navigate('/dashboard');
      }
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col transition-colors selection:bg-accent/30 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-bgPrimary/90 backdrop-blur-md border-b border-borderColor">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-subtle">
              <Zap size={20} className="fill-white" />
            </div>
            <span className="text-lg font-bold text-textPrimary tracking-tight">DevFlow</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-textSecondary">
            <a href="#features" className="hover:text-textPrimary transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-textPrimary transition-colors">
              1-Click Demo
            </a>
            <a href="#features" className="hover:text-textPrimary transition-colors">
              Architecture
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-borderColor bg-cardBg text-textSecondary hover:text-textPrimary hover:bg-bgSecondary transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-borderColor bg-cardBg text-textSecondary hover:text-textPrimary hover:bg-bgSecondary transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop Auth CTA */}
            <div className="hidden sm:flex items-center gap-2">
              {accessToken ? (
                <Link
                  to="/dashboard"
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-all shadow-subtle inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Go to Workspace</span>
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2.5 rounded-xl border border-borderColor bg-cardBg hover:bg-bgSecondary text-xs font-semibold text-textPrimary transition-colors inline-flex items-center justify-center whitespace-nowrap shrink-0"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4.5 sm:px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-all shadow-subtle inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={14} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-bgSecondary border-b border-borderColor p-4 space-y-3 animate-fade-in">
            <nav className="flex flex-col space-y-2 text-xs font-semibold text-textSecondary">
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-cardBg hover:text-textPrimary transition-colors"
              >
                Features
              </a>
              <a
                href="#demo"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-cardBg hover:text-textPrimary transition-colors"
              >
                1-Click Demo
              </a>
            </nav>

            <div className="pt-2 border-t border-borderColor flex flex-col gap-2">
              {accessToken ? (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-accent text-white text-xs font-semibold text-center shadow-subtle flex items-center justify-center gap-2"
                >
                  <span>Go to Workspace</span>
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl border border-borderColor bg-cardBg text-xs font-semibold text-textPrimary text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-accent text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-14 sm:pt-20 sm:pb-16 md:pt-28 md:pb-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] sm:text-xs font-semibold mb-6">
            <Sparkles size={14} />
            <span>Enterprise Multi-Tenant Developer Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-textPrimary tracking-tight leading-tight">
            Project Management Built for High-Performance Dev Teams
          </h1>

          <p className="mt-4 sm:mt-5 max-w-2xl mx-auto text-sm sm:text-base text-textSecondary leading-relaxed">
            Unify drag-and-drop Kanban boards, real-time WebSocket syncing, role-based security, and sprint analytics into one modern developer workspace.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to={accessToken ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-all shadow-subtle inline-flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{accessToken ? 'Go to Workspace' : 'Start Free Workspace'}</span>
              <ArrowRight size={16} />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-xl border border-borderColor bg-cardBg hover:bg-bgSecondary text-sm font-semibold text-textPrimary transition-colors inline-flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0"
            >
              <Sparkles size={16} className="text-accent" />
              <span>Try 1-Click Demo</span>
            </a>
          </div>
        </div>
      </section>

      {/* 1-Click Interactive Demo Section */}
      <section id="demo" className="py-12 sm:py-16 bg-bgSecondary/50 border-y border-borderColor">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-textPrimary tracking-tight">Instant 1-Click Product Demo</h2>
            <p className="text-xs text-textSecondary mt-1">Select a role below to explore DevFlow with real-time pre-seeded workspace data</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handleDemoLogin('owner@devflow.com')}
              className="p-5 rounded-2xl bg-cardBg border border-borderColor hover:border-accent transition-all text-left group shadow-subtle cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mb-3">
                <Crown size={20} />
              </div>
              <h4 className="text-sm font-bold text-textPrimary group-hover:text-accent transition-colors flex items-center justify-between">
                <span>Organization Owner</span>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-textSecondary mt-1">Full workspace administration, role assignments, and audit logs.</p>
            </button>

            <button
              onClick={() => handleDemoLogin('admin@devflow.com')}
              className="p-5 rounded-2xl bg-cardBg border border-borderColor hover:border-accent transition-all text-left group shadow-subtle cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-500 flex items-center justify-center mb-3">
                <ShieldCheck size={20} />
              </div>
              <h4 className="text-sm font-bold text-textPrimary group-hover:text-accent transition-colors flex items-center justify-between">
                <span>Workspace Admin</span>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-textSecondary mt-1">Manage project rosters, assign developers, and track sprint goals.</p>
            </button>

            <button
              onClick={() => handleDemoLogin('rahul@devflow.com')}
              className="p-5 rounded-2xl bg-cardBg border border-borderColor hover:border-accent transition-all text-left group shadow-subtle cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-500 flex items-center justify-center mb-3">
                <Code2 size={20} />
              </div>
              <h4 className="text-sm font-bold text-textPrimary group-hover:text-accent transition-colors flex items-center justify-between">
                <span>Lead Developer</span>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-textSecondary mt-1">Kanban task status updates, code discussions, and activity streams.</p>
            </button>

            <button
              onClick={() => handleDemoLogin('priya@devflow.com')}
              className="p-5 rounded-2xl bg-cardBg border border-borderColor hover:border-accent transition-all text-left group shadow-subtle cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-500 flex items-center justify-center mb-3">
                <Palette size={20} />
              </div>
              <h4 className="text-sm font-bold text-textPrimary group-hover:text-accent transition-colors flex items-center justify-between">
                <span>UI/UX Designer</span>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-xs text-textSecondary mt-1">Design review status tracking, comment threads, and notification alerts.</p>
            </button>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section id="features" className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary tracking-tight">Engineered for Modern Engineering Teams</h2>
            <p className="text-xs text-textSecondary mt-2">Everything your dev team needs to plan, track, and ship high-quality software</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-6 rounded-2xl bg-cardBg border border-borderColor shadow-subtle hover:border-accent/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mb-4">
                <Kanban size={20} />
              </div>
              <h3 className="text-base font-bold text-textPrimary">Drag-and-Drop Kanban</h3>
              <p className="text-xs text-textSecondary mt-2 leading-relaxed">
                Sort, move, and update tasks fluidly across status stages (Backlog, Todo, In Progress, In Review, Done) with optimistic UI updates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cardBg border border-borderColor shadow-subtle hover:border-accent/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mb-4">
                <Clock size={20} />
              </div>
              <h3 className="text-base font-bold text-textPrimary">Real-Time Syncing</h3>
              <p className="text-xs text-textSecondary mt-2 leading-relaxed">
                Powered by Socket.IO rooms. See task status updates, comment mentions, and notifications broadcasted to team members instantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cardBg border border-borderColor shadow-subtle hover:border-accent/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mb-4">
                <Lock size={20} />
              </div>
              <h3 className="text-base font-bold text-textPrimary">Dual-Level RBAC</h3>
              <p className="text-xs text-textSecondary mt-2 leading-relaxed">
                Enforce granular security at both Organization (Owner, Admin, Member) and Project levels (Manager, Developer, Viewer).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cardBg border border-borderColor shadow-subtle hover:border-accent/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mb-4">
                <Layers size={20} />
              </div>
              <h3 className="text-base font-bold text-textPrimary">Multi-Tenant Isolation</h3>
              <p className="text-xs text-textSecondary mt-2 leading-relaxed">
                Organize projects within dedicated organization spaces with isolated rosters and custom team settings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cardBg border border-borderColor shadow-subtle hover:border-accent/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mb-4">
                <Activity size={20} />
              </div>
              <h3 className="text-base font-bold text-textPrimary">Sprint Analytics</h3>
              <p className="text-xs text-textSecondary mt-2 leading-relaxed">
                Monitor team completion velocity, status distribution charts, and workload metrics powered by Recharts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cardBg border border-borderColor shadow-subtle hover:border-accent/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mb-4">
                <Sun size={20} />
              </div>
              <h3 className="text-base font-bold text-textPrimary">Dark & Light Themes</h3>
              <p className="text-xs text-textSecondary mt-2 leading-relaxed">
                Seamless mode switching built into the CSS variable design token system with persistent theme storage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-borderColor bg-cardBg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white">
              <Zap size={16} className="fill-white" />
            </div>
            <span className="text-sm font-bold text-textPrimary">DevFlow SaaS Platform</span>
          </div>

          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xs text-textSecondary">
              © {new Date().getFullYear()} DevFlow. All rights reserved. Enterprise Multi-Tenant Collaboration.
            </p>
            <p className="text-xs font-semibold text-accent flex items-center justify-center md:justify-start gap-1">
              <span>Designed & Developed by</span>
              <a
                href="https://github.com/Hardik-18449"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-accent-hover font-bold text-textPrimary"
              >
                Hardik Gurjar
              </a>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-textSecondary">
            <a
              href="https://github.com/Hardik-18449/DevFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-textPrimary transition-colors flex items-center gap-1 font-semibold text-accent"
            >
              GitHub Repository
            </a>
            <Link to="/login" className="hover:text-textPrimary transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-textPrimary transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
