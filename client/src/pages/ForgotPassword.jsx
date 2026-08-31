import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Loader2, MailCheck, AlertCircle } from 'lucide-react';
import { useForgotPasswordMutation } from '../services/api';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessData(null);

    try {
      const res = await forgotPassword({ email }).unwrap();
      if (res.success) {
        setSuccessData(res.data);
      }
    } catch (err) {
      setErrorMsg(err.data?.message || 'No account found with this email address. Please check your email.');
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
            <KeyRound size={24} />
          </div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Forgot password?</h1>
          <p className="text-xs text-textSecondary mt-1">
            Enter your registered email address to verify your account and receive password reset instructions.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-start gap-2.5 font-medium animate-fade-in">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-danger" />
            <div className="space-y-1">
              <p className="font-bold">Verification Failed</p>
              <p className="text-textSecondary">{errorMsg}</p>
            </div>
          </div>
        )}

        {successData ? (
          <div className="space-y-4 animate-fade-in">
            {successData.emailSent ? (
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs text-center space-y-3">
                <MailCheck size={32} className="mx-auto text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-textPrimary">Password Reset Email Sent!</h3>
                  <p className="text-xs text-textSecondary mt-1">{successData.message}</p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-accent/10 border border-accent/30 text-textPrimary text-xs space-y-3">
                <div className="flex items-center gap-2.5 text-accent font-bold">
                  <CheckCircle2 size={20} />
                  <span>Account Email Verified!</span>
                </div>
                <p className="text-xs text-textSecondary leading-relaxed">
                  {successData.message}
                </p>
                {successData.resetToken && (
                  <div className="pt-2 border-t border-accent/20">
                    <button
                      onClick={() => navigate(`/reset-password?token=${successData.resetToken}`)}
                      className="w-full py-3 px-4 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-all flex items-center justify-center gap-2 shadow-subtle cursor-pointer"
                    >
                      <span>Proceed to Reset Password</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            <Link
              to="/login"
              className="w-full py-2.5 block text-center rounded-xl border border-borderColor bg-cardBg text-xs font-semibold text-textPrimary hover:bg-bgSecondary transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                disabled={isLoading}
                placeholder="owner@devflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-bgSecondary border border-borderColor rounded-xl text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-all shadow-subtle flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Account Email...</span>
                </>
              ) : (
                <>
                  <span>Verify Email & Reset</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
