const http = require('http');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const { initRedis } = require('./config/redis');
const { initSocket } = require('./sockets/socket');
const autoSeedIfEmpty = require('./utils/autoSeed');

const server = http.createServer(app);

initSocket(server);

const startServer = async () => {
  try {
    await connectDB();
    await autoSeedIfEmpty();
    await initRedis();

    server.listen(env.PORT, () => {
      console.log(`============================================`);
      console.log(`DevFlow API Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`============================================`);
    });
  } catch (error) {
    console.error('Failed to start DevFlow server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { server, app };
