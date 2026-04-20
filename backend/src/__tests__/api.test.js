const request = require('supertest');
const createApp = require('../app');
const { closeDb, getDb } = require('../config/database');

let app;

beforeEach(() => {
  closeDb();
  getDb(); // fresh in-memory DB
  app = createApp();
});

afterAll(() => {
  closeDb();
});

const validTask = {
  title: 'Review case bundle',
  description: 'Go through all docs',
  status: 'PENDING',
  dueDate: '2026-12-31T17:00:00.000Z',
};

describe('POST /api/tasks', () => {
  test('creates a task with all fields', async () => {
    const res = await request(app).post('/api/tasks').send(validTask);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: validTask.title,
      description: validTask.description,
      status: 'PENDING',
      dueDate: validTask.dueDate,
    });
    expect(res.body.id).toEqual(expect.any(String));
  });

  test('creates a task without description', async () => {
    const { description, ...rest } = validTask;
    const res = await request(app).post('/api/tasks').send(rest);
    expect(res.status).toBe(201);
    expect(res.body.description).toBeNull();
  });

  test('defaults status to PENDING when omitted', async () => {
    const { status, ...rest } = validTask;
    const res = await request(app).post('/api/tasks').send(rest);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('PENDING');
  });

  test('rejects missing title', async () => {
    const { title, ...rest } = validTask;
    const res = await request(app).post('/api/tasks').send(rest);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'title' })])
    );
  });

  test('rejects missing dueDate', async () => {
    const { dueDate, ...rest } = validTask;
    const res = await request(app).post('/api/tasks').send(rest);
    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'dueDate' })])
    );
  });

  test('rejects invalid status', async () => {
    const res = await request(app).post('/api/tasks').send({ ...validTask, status: 'INVALID' });
    expect(res.status).toBe(400);
  });

  test('rejects invalid dueDate format', async () => {
    const res = await request(app).post('/api/tasks').send({ ...validTask, dueDate: 'not-a-date' });
    expect(res.status).toBe(400);
  });

  test('rejects title exceeding 200 characters', async () => {
    const res = await request(app).post('/api/tasks').send({ ...validTask, title: 'x'.repeat(201) });
    expect(res.status).toBe(400);
  });

  test('rejects malformed JSON', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send('{"title": "broken"');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/tasks', () => {
  test('returns empty array when no tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all tasks', async () => {
    await request(app).post('/api/tasks').send(validTask);
    await request(app).post('/api/tasks').send({ ...validTask, title: 'Second' });
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /api/tasks/:id', () => {
  test('returns an existing task', async () => {
    const created = await request(app).post('/api/tasks').send(validTask);
    const res = await request(app).get(`/api/tasks/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  test('returns 404 for non-existent task', async () => {
    const res = await request(app).get('/api/tasks/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});

describe('PATCH /api/tasks/:id/status', () => {
  test('updates status', async () => {
    const created = await request(app).post('/api/tasks').send(validTask);
    const res = await request(app)
      .patch(`/api/tasks/${created.body.id}/status`)
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('COMPLETED');
  });

  test('rejects invalid status value', async () => {
    const created = await request(app).post('/api/tasks').send(validTask);
    const res = await request(app)
      .patch(`/api/tasks/${created.body.id}/status`)
      .send({ status: 'BOGUS' });
    expect(res.status).toBe(400);
  });

  test('returns 404 for non-existent task', async () => {
    const res = await request(app)
      .patch('/api/tasks/nonexistent/status')
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/tasks/:id', () => {
  test('updates provided fields', async () => {
    const created = await request(app).post('/api/tasks').send(validTask);
    const res = await request(app)
      .put(`/api/tasks/${created.body.id}`)
      .send({ title: 'New Title', status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New Title');
    expect(res.body.status).toBe('IN_PROGRESS');
    expect(res.body.dueDate).toBe(validTask.dueDate);
  });

  test('rejects empty update body', async () => {
    const created = await request(app).post('/api/tasks').send(validTask);
    const res = await request(app).put(`/api/tasks/${created.body.id}`).send({});
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/tasks/:id', () => {
  test('deletes an existing task', async () => {
    const created = await request(app).post('/api/tasks').send(validTask);
    const res = await request(app).delete(`/api/tasks/${created.body.id}`);
    expect(res.status).toBe(204);

    const after = await request(app).get(`/api/tasks/${created.body.id}`);
    expect(after.status).toBe(404);
  });

  test('returns 404 for non-existent task', async () => {
    const res = await request(app).delete('/api/tasks/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('GET /health', () => {
  test('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Unknown routes', () => {
  test('returns 404 with descriptive error', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});
