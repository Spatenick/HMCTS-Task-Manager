const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');

const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

/**
 * Map a raw DB row (snake_case) to the API representation (camelCase).
 */
function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function create({ title, description, status, dueDate }) {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, description, status, due_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, title, description || null, status, dueDate, now, now);

  return findById(id);
}

function findById(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return mapRow(row);
}

function findAll() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM tasks ORDER BY due_date ASC, created_at DESC').all();
  return rows.map(mapRow);
}

function updateStatus(id, status) {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.prepare(`
    UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?
  `).run(status, now, id);

  if (result.changes === 0) return null;
  return findById(id);
}

function update(id, { title, description, status, dueDate }) {
  const db = getDb();
  const existing = findById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, status = ?, due_date = ?, updated_at = ?
    WHERE id = ?
  `).run(
    title ?? existing.title,
    description !== undefined ? description : existing.description,
    status ?? existing.status,
    dueDate ?? existing.dueDate,
    now,
    id
  );

  return findById(id);
}

function remove(id) {
  const db = getDb();
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}

module.exports = {
  VALID_STATUSES,
  create,
  findById,
  findAll,
  updateStatus,
  update,
  remove,
};
