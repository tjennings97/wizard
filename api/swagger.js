import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wizard App API',
      version: '1.0.0',
      description: 'Swagger documentation for the Wizard App APIs',
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ]
  },
  apis: ['./api/routes/*.js'],
};


export  {
  swaggerUi
}