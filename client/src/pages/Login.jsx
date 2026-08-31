import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ShieldCheck, ArrowRight, ArrowLeft, Sparkles, Crown, Code2, Palette, Eye, EyeOff } from 'lucide-react';
import { useLoginMutation } from '../services/api';
import { setCredentials } from '../features/auth/authSlice';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e, customCredentials) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const payload = customCredentials || { email, password };
    try {
      const res = await login(payload).unwrap();
      if (res.success) {
        dispatch(setCredentials({ user: res.data.user, tokens: res.data.tokens, organization: res.data.organization }));
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.data?.message || 'Invalid email or password.');
    }
  };

  const handleDemoLogin = (roleEmail) => {
    handleLogin(null, { email: roleEmail, password: 'Password123!' });
  };

  return (
    <div className="min-h-screen bg-bgPrimary flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      <div className="w-full max-w-md bg-cardBg border border-borderColor rounded-2xl p-8 shadow-card relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white mb-3 shadow-subtle">
            <Zap size={24} className="fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Welcome back to DevFlow</h1>
          <p className="text-xs text-textSecondary mt-1">Multi-tenant developer workspace & collaboration suite</p>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
          <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
            <Sparkles size={14} /> 1-Click Demo Login
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoLogin('owner@devflow.com')}
              className="px-3 py-2 rounded-lg bg-cardBg hover:bg-accent text-textPrimary hover:text-white font-semibold transition-all border border-borderColor flex items-center gap-2 group cursor-pointer"
            >
              <Crown size={14} className="text-amber-500 shrink-0 group-hover:text-white transition-colors" />
              <span>Owner</span>
            </button>
            <button
              onClick={() => handleDemoLogin('admin@devflow.com')}
              className="px-3 py-2 rounded-lg bg-cardBg hover:bg-accent text-textPrimary hover:text-white font-semibold transition-all border border-borderColor flex items-center gap-2 group cursor-pointer"
            >
              <ShieldCheck size={14} className="text-purple-500 shrink-0 group-hover:text-white transition-colors" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => handleDemoLogin('rahul@devflow.com')}
              className="px-3 py-2 rounded-lg bg-cardBg hover:bg-accent text-textPrimary hover:text-white font-semibold transition-all border border-borderColor flex items-center gap-2 group cursor-pointer"
            >
              <Code2 size={14} className="text-blue-500 shrink-0 group-hover:text-white transition-colors" />
              <span>Rahul (Dev)</span>
            </button>
            <button
              onClick={() => handleDemoLogin('priya@devflow.com')}
              className="px-3 py-2 rounded-lg bg-cardBg hover:bg-accent text-textPrimary hover:text-white font-semibold transition-all border border-borderColor flex items-center gap-2 group cursor-pointer"
            >
              <Palette size={14} className="text-pink-500 shrink-0 group-hover:text-white transition-colors" />
              <span>Priya (UI/UX)</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="owner@devflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-bgSecondary border border-borderColor rounded-xl text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-accent hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-bgSecondary border border-borderColor rounded-xl text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-all shadow-subtle flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-textSecondary">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
