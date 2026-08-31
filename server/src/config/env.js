const dotenv = require('dotenv');
const path = require('path');
const { z } = require('zod');

dotenv.config({ path: path.join(__dirname, '../../.env'), override: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  MONGO_URI: z.string().default('mongodb://127.0.0.1:27017/devflow'),
  JWT_ACCESS_SECRET: z.string().default('devflow_access_secret_key_2026_super_secure'),
  JWT_REFRESH_SECRET: z.string().default('devflow_refresh_secret_key_2026_super_secure'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  SMTP_HOST: z.string().optional().default('smtp.ethereal.email'),
  SMTP_PORT: z.string().optional().default('587').transform((val) => parseInt(val, 10)),
  SMTP_USER: z.string().optional().default('test@ethereal.email'),
  SMTP_PASS: z.string().optional().default('password'),
});

let env = {};
try {
  env = envSchema.parse(process.env);
} catch (err) {
  console.warn('Environment variables validation warning:', err.message || err);
  env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devflow',
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'devflow_access_secret_key_2026_super_secure',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'devflow_refresh_secret_key_2026_super_secure',
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.ethereal.email',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_USER: process.env.SMTP_USER || 'test@ethereal.email',
    SMTP_PASS: process.env.SMTP_PASS || 'password',
  };
}

module.exports = env;
