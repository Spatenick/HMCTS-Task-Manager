require('dotenv').config();
const createApp = require('./app');
const { getDb } = require('./config/database');

const PORT = process.env.PORT || 4000;

// Initialise DB on startup so schema exists before the first request
getDb();

const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 HMCTS Task Manager API running on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`📘 API docs:  http://localhost:${PORT}/api-docs`);
});
