import bcrypt from 'bcryptjs';
import { calculateExpiration, generateAccessToken, generateRefreshToken } from '../services/auth.service.js';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prisma.client.js';
import ms from 'ms';

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
      userInfo: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
      // accessToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = generateAccessToken({ id: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  // Get IP address and User-Agent from request headers
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  const accessTokenExpiresAt = calculateExpiration(process.env.JWT_ACCESS_EXPIRATION);
  const refreshTokenExpiresAt = calculateExpiration(process.env.JWT_REFRESH_EXPIRATION);

  console.log(accessTokenExpiresAt);
  console.log(refreshTokenExpiresAt);
  

  const refreshTokenExpirationTime = ms(process.env.JWT_REFRESH_EXPIRATION);

  // Check if a refresh token already exists for this user, IP address, and user-agent
  const existingRefreshToken = await prisma.refreshToken.findFirst({
    where: {
      userId: user.id,
      ipAddress,
      userAgent,
      isValid: true, // Only consider valid tokens
    },
  });

  if (existingRefreshToken) {
    // If a token exists, update the expiration date to extend its validity
    await prisma.refreshToken.update({
      where: { id: existingRefreshToken.id },
      data: {
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt, // Use the dynamically calculated expiration
      },
    });
  } else {
    // If no token exists, create a new refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        ipAddress,
        userAgent,
        expiresAt: refreshTokenExpiresAt, // Use the dynamically calculated expiration
      },
    });
  }

  res.cookie('refreshToken', refreshToken, { maxAge: refreshTokenExpirationTime, httpOnly: true, secure: true, sameSite: 'Strict' });

  return res.json({
    message: 'User logged in successfully',
    accessToken,
    expiresAt: accessTokenExpiresAt
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

  if (!refreshToken) return res.status(204).json({ message: "No refresh token found" });

  // Decode the refresh token to get the user ID
  const decoded = jwt.decode(refreshToken);

  if (!decoded || !decoded.id) {
    return res.status(400).json({ message: 'Invalid refresh token' });
  }

  // Use Prisma to update the user's refreshToken field to null
  await prisma.user.update({
    where: { id: decoded.id },
    data: { refresh_token: null },  // Set the refreshToken field to null
  });

  // Clear the refresh token from the cookie
  res.clearCookie('refreshToken').status(200).json({ message: "Logged out Successfully" });
};