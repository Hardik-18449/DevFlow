const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const env = require('./config/env');
const connectDB = require('./config/db');
const autoSeedIfEmpty = require('./utils/autoSeed');
const errorHandler = require('./middleware/error.middleware');
const sanitizeInput = require('./middleware/sanitize.middleware');
const { authRateLimiter, apiRateLimiter } = require('./middleware/rateLimit.middleware');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const orgRoutes = require('./modules/organizations/organization.routes');
const projectRoutes = require('./modules/projects/project.routes');
const taskRoutes = require('./modules/tasks/task.routes');
const commentRoutes = require('./modules/comments/comment.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const activityRoutes = require('./modules/activities/activity.routes');
const searchRoutes = require('./modules/search/search.routes');
const uploadRoutes = require('./modules/uploads/upload.routes');

const app = express();

// Trust Vercel / cloud reverse proxy headers for rate limiting
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      },
    },
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInput);

// Database auto-connection middleware for serverless environments (Vercel)
app.use(async (req, res, next) => {
  if (req.path === '/health') return next();
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
      autoSeedIfEmpty().catch((err) => console.error('[AutoSeed Error]:', err.message));
    }
    next();
  } catch (err) {
    console.error('[DB Middleware Error]:', err.message);
    next(err);
  }
});

app.use('/api', apiRateLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRateLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/organizations', orgRoutes);
app.use('/api/v1', projectRoutes);
app.use('/api/v1', taskRoutes);
app.use('/api/v1', commentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1', activityRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/uploads', uploadRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
    statusCode: 404,
  });
});

app.use(errorHandler);

module.exports = app;
