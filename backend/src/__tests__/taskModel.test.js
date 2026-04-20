const { closeDb } = require('../config/database');
const taskModel = require('../models/taskModel');

beforeEach(() => {
  closeDb();
});

afterAll(() => {
  closeDb();
});

describe('taskModel', () => {
  const sampleTask = {
    title: 'Review case bundle',
    description: 'Go through documents',
    status: 'PENDING',
    dueDate: '2026-12-31T17:00:00.000Z',
  };

  test('create() persists and returns a task with an id and timestamps', () => {
    const task = taskModel.create(sampleTask);
    expect(task.id).toEqual(expect.any(String));
    expect(task.title).toBe(sampleTask.title);
    expect(task.description).toBe(sampleTask.description);
    expect(task.status).toBe('PENDING');
    expect(task.dueDate).toBe(sampleTask.dueDate);
    expect(task.createdAt).toEqual(expect.any(String));
    expect(task.updatedAt).toEqual(expect.any(String));
  });

  test('create() handles null description', () => {
    const task = taskModel.create({ ...sampleTask, description: undefined });
    expect(task.description).toBeNull();
  });

  test('findById() returns null for non-existent task', () => {
    expect(taskModel.findById('nonexistent')).toBeNull();
  });

  test('findById() returns the created task', () => {
    const created = taskModel.create(sampleTask);
    const fetched = taskModel.findById(created.id);
    expect(fetched).toEqual(created);
  });

  test('findAll() returns all tasks', () => {
    taskModel.create(sampleTask);
    taskModel.create({ ...sampleTask, title: 'Task 2' });
    const all = taskModel.findAll();
    expect(all).toHaveLength(2);
  });

  test('updateStatus() changes only the status', () => {
    const created = taskModel.create(sampleTask);
    const updated = taskModel.updateStatus(created.id, 'COMPLETED');
    expect(updated.status).toBe('COMPLETED');
    expect(updated.title).toBe(created.title);
  });

  test('updateStatus() returns null if task does not exist', () => {
    expect(taskModel.updateStatus('nonexistent', 'COMPLETED')).toBeNull();
  });

  test('update() applies partial updates', () => {
    const created = taskModel.create(sampleTask);
    const updated = taskModel.update(created.id, { title: 'New title' });
    expect(updated.title).toBe('New title');
    expect(updated.description).toBe(created.description);
    expect(updated.status).toBe(created.status);
  });

  test('remove() deletes the task and returns true', () => {
    const created = taskModel.create(sampleTask);
    expect(taskModel.remove(created.id)).toBe(true);
    expect(taskModel.findById(created.id)).toBeNull();
  });

  test('remove() returns false when task does not exist', () => {
    expect(taskModel.remove('nonexistent')).toBe(false);
  });
});
