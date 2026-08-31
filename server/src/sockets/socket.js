const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../modules/users/user.model');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] User connected: ${socket.user.name} (${socket.user._id}) [SocketID: ${socket.id}]`);

    // Automatically join personal user room for direct notifications
    socket.join(`user:${socket.user._id}`);

    // Join Project Room
    socket.on('project.join', ({ projectId }) => {
      if (projectId) {
        socket.join(`project:${projectId}`);
        console.log(`[Socket.IO] User ${socket.user.name} joined project:${projectId}`);
      }
    });

    // Leave Project Room
    socket.on('project.leave', ({ projectId }) => {
      if (projectId) {
        socket.leave(`project:${projectId}`);
        console.log(`[Socket.IO] User ${socket.user.name} left project:${projectId}`);
      }
    });

    // Typing Indicators
    socket.on('typing.start', ({ projectId, taskId }) => {
      socket.to(`project:${projectId}`).emit('typing.start', {
        userId: socket.user._id,
        userName: socket.user.name,
        taskId,
      });
    });

    socket.on('typing.stop', ({ projectId, taskId }) => {
      socket.to(`project:${projectId}`).emit('typing.stop', {
        userId: socket.user._id,
        taskId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
