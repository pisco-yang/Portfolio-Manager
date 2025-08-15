const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio Manager API',
      version: '1.0.0',
      description: 'A comprehensive API for managing investment portfolios',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
  },
  apis: ['./backend/routers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs; 