const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/modules/users/user.model');
const { generateTokens } = require('../src/modules/auth/auth.service');

describe('Security & Input Validation Middleware', () => {
  let mongoServer;
  let authToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    const user = await User.create({
      name: 'Validation User',
      email: 'validation@devflow.com',
      passwordHash: 'hashedpass123',
    });

    const tokens = generateTokens(user);
    authToken = tokens.accessToken;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('should reject registration with invalid email format', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'John Doe',
      email: 'not-an-email',
      password: 'Password123!',
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('should reject registration with short password (< 6 chars)', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123',
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('should reject organization access with malformed ObjectId param', async () => {
    const res = await request(app)
      .get('/api/v1/organizations/invalid-id-123')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});
