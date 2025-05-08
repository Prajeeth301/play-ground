import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth.routes.js';
import { authenticateToken } from './src/middlewares/auth.middleware.js';
import cors from 'cors';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { health } from './src/controllers/health.controller.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const swaggerYMLPath = path.join(__dirname, 'swagger.yml');
const swaggerDocument = YAML.load(swaggerYMLPath);

const app = express();


app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true // using cookies or Authorization header
}));


app.use(express.json());
app.use(cookieParser());

// Setup EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Specify the folder for views

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRoutes);

app.get('/api/health', health);

app.get('/api/protected', authenticateToken, (req, res) => {
    res.send('This is a protected route');
});

// Catch-all route for empty or undefined routes and redirect to Swagger docs
app.all('/', (req, res) => {
    res.redirect('/api/health');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("backend: CI/CD Trail : 6");
    console.log(`Server running on port ${PORT}`);
});
