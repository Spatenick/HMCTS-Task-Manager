const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HMCTS Task Manager API',
      version: '1.0.0',
      description: 'REST API for managing caseworker tasks in the HMCTS task management system.',
      contact: { name: 'HMCTS DTS' },
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Local development' },
    ],
  },
  apis: [path.join(__dirname, '..', 'routes', '*.js')],
});

module.exports = swaggerSpec;
