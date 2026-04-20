const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const taskRoutes = require('./routes/taskRoutes');
const swaggerSpec = require('./config/swagger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
  }));
  app.use(express.json({ limit: '1mb' }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

  // Routes
  app.use('/api/tasks', taskRoutes);

  // 404 + error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
