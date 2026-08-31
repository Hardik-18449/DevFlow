import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useRegisterMutation } from '../services/api';
import { setCredentials } from '../features/auth/authSlice';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [registerUser, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await registerUser({ name, email, password }).unwrap();
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
      setErrorMsg(err.data?.message || 'Registration failed. Please try again.');
    }
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
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Create your account</h1>
          <p className="text-xs text-textSecondary mt-1">Start collaborating with your dev team today</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="Hardik"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-bgSecondary border border-borderColor rounded-xl text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="hardik@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-bgSecondary border border-borderColor rounded-xl text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
              Password
            </label>
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
            {isLoading ? 'Creating Account...' : 'Get Started'} <ArrowRight size={16} />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-textSecondary">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
