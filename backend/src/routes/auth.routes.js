import express from 'express';
// import { authenticateToken } from '../middlewares/auth.middleware.js';
import { login, logout, refreshToken, register } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.post('/refresh-token', refreshToken);

router.post('/logout', logout);

export default router;
