const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

let db;

/**
 * Initialise and return a singleton database connection.
 * In test mode uses an in-memory database so tests don't pollute disk.
 *
 * Uses Node's built-in `node:sqlite` module (stable since Node 22.5) so there
 * are no native-compilation steps — clone and `npm install` just works.
 */
function getDb() {
  if (db) return db;

  if (process.env.NODE_ENV === 'test') {
    db = new DatabaseSync(':memory:');
  } else {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'tasks.db');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new DatabaseSync(dbPath);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED','CANCELLED')),
      due_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
  `);

  return db;
}

/**
 * Close the database connection. Primarily used in test teardown.
 */
function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, closeDb };
