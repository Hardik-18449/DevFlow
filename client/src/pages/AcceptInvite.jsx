import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle2, AlertCircle, Building2, Loader2 } from 'lucide-react';
import { setCurrentOrganization } from '../features/auth/authSlice';

export const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const { accessToken } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const autoAccept = async () => {
      if (!tokenFromUrl) {
        setStatus('error');
        setErrorMsg('Invalid or missing invitation token link.');
        return;
      }

      if (!accessToken) {
        // Save target redirect in localStorage so after login/register they return automatically
        localStorage.setItem('pending_invite_token', tokenFromUrl);
        navigate(`/login?redirect=${encodeURIComponent(`/accept-invite?token=${tokenFromUrl}`)}`);
        return;
      }

      try {
        const res = await fetch('/api/v1/organizations/invitations/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ token: tokenFromUrl }),
        });

        const data = await res.json();
        if (res.ok && data.success && isMounted) {
          setStatus('success');
          if (data.data?.organization) {
            dispatch(setCurrentOrganization(data.data.organization));
          }
          setTimeout(() => {
            navigate('/dashboard');
          }, 1200);
        } else if (isMounted) {
          setStatus('error');
          setErrorMsg(data.message || 'Failed to accept invitation.');
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setErrorMsg('Network error processing invitation link.');
        }
      }
    };

    autoAccept();

    return () => {
      isMounted = false;
    };
  }, [tokenFromUrl, accessToken, navigate, dispatch]);

  return (
    <div className="min-h-screen bg-bgPrimary flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md bg-cardBg border border-borderColor rounded-2xl p-8 shadow-card text-center space-y-6 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mx-auto shadow-subtle">
          <Building2 size={28} />
        </div>

        {status === 'processing' && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-textPrimary">Joining Organization Workspace...</h2>
            <p className="text-xs text-textSecondary">Verifying invitation and setting up workspace access.</p>
            <div className="pt-2 flex justify-center text-accent">
              <Loader2 size={24} className="animate-spin" />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
              <CheckCircle2 size={20} />
            </div>
            <h2 className="text-xl font-bold text-textPrimary">Invitation Accepted!</h2>
            <p className="text-xs text-success font-medium">Joined workspace successfully. Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-danger/20 text-danger flex items-center justify-center mx-auto">
              <AlertCircle size={20} />
            </div>
            <h2 className="text-xl font-bold text-textPrimary">Invitation Link Error</h2>
            <p className="text-xs text-danger font-medium">{errorMsg}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-colors shadow-subtle"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
