export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'backend application',
            version: '1.0.0',
            description: 'backend application APIs',
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
        servers: [
            {
                url: 'http://localhost:3000', // Update to your base URL
            },
        ],
    },
    apis: [
        './server.js',
        './src/routes/*.js'
    ], // Path to your route files
};
