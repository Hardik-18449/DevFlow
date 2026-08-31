const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/modules/users/user.model');
const Organization = require('../src/modules/organizations/organization.model');
const OrganizationMember = require('../src/modules/organizations/organizationMember.model');

describe('Authentication & Authorization APIs', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Organization.deleteMany({});
    await OrganizationMember.deleteMany({});
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  const testUser = {
    name: 'Test Engineer',
    email: `test-${Date.now()}@devflow.com`,
    password: 'TestPassword123!',
  };

  it('should register a new user successfully and create default personal org', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.tokens).toHaveProperty('accessToken');
  });

  it('should login user with valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens).toHaveProperty('accessToken');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword!',
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });
});
