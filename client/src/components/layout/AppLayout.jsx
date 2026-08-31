import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { connectSocket, disconnectSocket } from '../../sockets/socket';
import { api, useRefreshTokenMutation } from '../../services/api';
import { setCredentials } from '../../features/auth/authSlice';
import { useToast } from '../ui/ToastContainer';

export const AppLayout = () => {
  const { accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [isInitializing, setIsInitializing] = useState(!accessToken);
  const [refreshToken] = useRefreshTokenMutation();

  useEffect(() => {
    let isMounted = true;
    const silentRefresh = async () => {
      if (!accessToken) {
        try {
          const res = await refreshToken().unwrap();
          if (res?.success && res?.data?.tokens && isMounted) {
            dispatch(setCredentials({ user: res.data.user, tokens: res.data.tokens }));
          }
        } catch (err) {
          // Token expired or not logged in
        } finally {
          if (isMounted) setIsInitializing(false);
        }
      } else {
        setIsInitializing(false);
      }
    };

    silentRefresh();

    return () => {
      isMounted = false;
    };
  }, [accessToken, refreshToken, dispatch]);

  useEffect(() => {
    if (accessToken) {
      const socket = connectSocket(accessToken);
      if (socket) {
        socket.on('notification.created', (notif) => {
          dispatch(api.util.invalidateTags(['Notification']));
          if (notif) {
            addToast({
              title: notif.title || 'New Notification',
              message: notif.message || 'You have a new activity update',
              type: 'info',
            });
          }
        });
      }
    }
    return () => {
      disconnectSocket();
    };
  }, [accessToken, dispatch, addToast]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-bgPrimary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-bgPrimary text-textPrimary selection:bg-accent/30 selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
