import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../services/auth.service.js';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prisma.client.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // const accessToken = generateAccessToken({ id: newUser.id, email: newUser.email });
    // const refreshToken = generateRefreshToken({ id: newUser.id, email: newUser.email });

    // await prisma.refreshToken.create({
    //   data: {
    //     userId: newUser.id,
    //     token: refreshToken,
    //   },
    // });

    return res.status(201).json({
      message: 'User registered successfully',
      newUser
      // accessToken,
      // refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(400).json({ error: 'Invalid credentials' });

  const accessToken = generateAccessToken({ id: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  const existingToken = await prisma.refreshToken.findFirst({
    where: { userId: user.id },
  });

  if (existingToken) {
    // Just update token — updatedAt will auto-update
    await prisma.refreshToken.update({
      where: { userId: user.id },
      data: { token: refreshToken },
    });
  } else {
    // Create new row — createdAt will auto-set
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
      },
    });
  }

  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true , sameSite: 'Strict'});

  return res.json({
    message: 'User logged in successfully',
    accessToken
  });
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  const storedToken = await prisma.refreshToken.findFirst({
    where: { token: refreshToken },
  });

  if (!storedToken) return res.status(403).json({ error: 'Invalid refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || '123456');
    const user = await prisma.user.findFirst({
      where: { id: decoded.id },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const newAccessToken = generateAccessToken({ id: user.id, email: user.email });

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'Strict' });
    return res.status(403).json({ error: 'Invalid refresh token', MaxRetriesCompleted: true });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(204).json({});

  const decoded = jwt.decode(refreshToken);
  await db.execute('UPDATE users SET refresh_token = NULL WHERE id = ?', [decoded?.id]);

  res.clearCookie('refreshToken').status(200).json({message : "Logged out Successfully"});
}