import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import ms from 'ms';

dotenv.config();

const secret = process.env.JWT_SECRET || '123456';
const accessTokenExpiry = process.env.JWT_ACCESS_EXPIRATION || '15m';
const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRATION || '7d';

// Generate access token
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, secret, { expiresIn: accessTokenExpiry });
};

// Generate refresh token
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, secret, { expiresIn: refreshTokenExpiry });
};

export const calculateExpiration = (expirationString) => {
  const expirationTimeInMs = ms(expirationString); // Convert to milliseconds using ms package
  const expirationDate =  new Date(Date.now() + expirationTimeInMs); // Return the expiration date
  console.log('Expiration date:', expirationDate);
  return expirationDate
};
