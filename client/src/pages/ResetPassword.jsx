import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Zap, ArrowLeft, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
import { useResetPasswordMutation } from '../services/api';
import { useToast } from '../components/ui/ToastContainer';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedToken = token.trim();
    if (!trimmedToken) {
      setErrorMsg('Security reset token is required.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      const res = await resetPassword({ token: trimmedToken, password }).unwrap();
      if (res.success) {
        addToast({
          title: 'Password Reset Successful',
          message: 'Your password has been reset. You can now log in with your new password.',
          type: 'success',
        });
        navigate('/login');
      }
    } catch (err) {
      setErrorMsg(err.data?.message || 'Password reset failed. Token may be invalid or expired.');
    }
  };

  return (
    <div className="min-h-screen bg-bgPrimary flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      <div className="w-full max-w-md bg-cardBg border border-borderColor rounded-2xl p-8 shadow-card relative z-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-textSecondary hover:text-textPrimary transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Sign In</span>
        </Link>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mb-3 shadow-subtle">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Set new password</h1>
          <p className="text-xs text-textSecondary mt-1">
            Choose a strong new password for your DevFlow account.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!tokenFromUrl && (
            <div>
              <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
                Reset Security Token
              </label>
              <input
                type="text"
                required
                placeholder="Paste security reset token..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-2.5 bg-bgSecondary border border-borderColor rounded-xl text-xs font-mono text-textPrimary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
              New Password
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

          <div>
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-bgSecondary border border-borderColor rounded-xl text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-all shadow-subtle flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? 'Updating Password...' : 'Reset Password'} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
