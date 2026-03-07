const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';

const app = require('../app');

let mongoServer;
let token;
let taskId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Auth + Tasks API', () => {
  test('should register a new user', async () => {
    const payload = {
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
    };

    const response = await request(app).post('/api/auth/register').send(payload);

    expect(response.statusCode).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(payload.email);

    token = response.body.token;
  });

  test('should login user', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: '123456',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test('should create task', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Ship MVP',
        description: 'Build and deploy first version',
        priority: 'high',
        status: 'in-progress',
        tags: ['mvp', 'release'],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe('Ship MVP');
    expect(response.body.priority).toBe('high');

    taskId = response.body._id;
  });

  test('should return paginated tasks', async () => {
    const response = await request(app)
      .get('/api/tasks?page=1&limit=5&search=Ship')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.tasks)).toBe(true);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.tasks.length).toBeGreaterThan(0);
  });

  test('should update task', async () => {
    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('completed');
  });

  test('should archive task', async () => {
    const response = await request(app)
      .patch(`/api/tasks/${taskId}/archive`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.task.isArchived).toBe(true);
  });
});
