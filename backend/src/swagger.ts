import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Listing',
      version: '1.0.0',
      description: 'API documentation with Swagger UI',
    },
    servers: [
      {
        url: process.env.API_URL,
      },
    ],
    // components: {
    //   securitySchemes: {
    //     BearerAuth: {
    //       type: 'http',
    //       scheme: 'bearer',
    //       bearerFormat: 'JWT',
    //     },
    //   },
    // },
    // security: [
    //   {
    //     BearerAuth: [],
    //   },
    // ],
  },
  apis: ['./src/routes/*.ts', './src/auth/*ts'],
};


const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}