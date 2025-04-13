import express from 'express';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth.routes.js';
import { swaggerOptions } from './swagger.options.js';
import { authenticateToken } from './src/middlewares/auth.middleware.js';
import cors from 'cors';

dotenv.config();
const specs = swaggerJsdoc(swaggerOptions);

const app = express();


app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true // using cookies or Authorization header
}));


app.use(express.json());
app.use(cookieParser());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/auth', authRoutes);


/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health of the application
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Get Health status of Server, DB
 *       400:
 *         description: Bad Request
 */
app.get('/api/health', (req, res) => {
    res.send({ message: 'API is healthy' });
});


/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Protected route that requires authentication
 *     tags: [Test]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Protected route access granted
 *       401:
 *         description: Unauthorized
 */
app.get('/api/protected', authenticateToken, (req, res) => {
    res.send('This is a protected route');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
