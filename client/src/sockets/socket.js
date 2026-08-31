import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (!token) return null;
  if (socket && socket.connected) return socket;

  socket = io(window.location.origin, {
    auth: { token },
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to server ID:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
