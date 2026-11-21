const request = require('supertest');
process.env.DB_PATH = './server/db/fable.sqlite';
process.env.PORT = '4001';
const app = require('../server/index');

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/prompts', () => {
  it('returns an array of prompts', async () => {
    const res = await request(app).get('/api/prompts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('each prompt has id, text, and order_index', async () => {
    const res = await request(app).get('/api/prompts');
    res.body.forEach((p) => {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('text');
      expect(p).toHaveProperty('order_index');
    });
  });
});

describe('GET /api/users', () => {
  it('returns an array of users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/stories', () => {
  it('creates a story with valid data and returns 201', async () => {
    const res = await request(app)
      .post('/api/stories')
      .set('x-user-id', '1')
      .send({ title: 'Test Story', content: 'Some content' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Test Story');
  });

  it('returns 401 when x-user-id header is missing', async () => {
    const res = await request(app)
      .post('/api/stories')
      .send({ title: 'No Auth Story', content: 'content' });
    expect(res.status).toBe(401);
  });

  test('returns 400 when story title is missing', async () => {
    const res = await request(app)
      .post('/api/stories')
      .set('x-user-id', '1')
      .send({ content: 'Story without title' });
  
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });
});

describe('GET /api/stories', () => {
  it('returns stories for authenticated user', async () => {
    const res = await request(app)
      .get('/api/stories')
      .set('x-user-id', '1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 401 without auth header', async () => {
    const res = await request(app).get('/api/stories');
    expect(res.status).toBe(401);
  });
});