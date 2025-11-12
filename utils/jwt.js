const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret-key-change-in-production';
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

/**
 * Генерирует access токен
 * @returns {Object} { token, expiresIn }
 */
const generateAccessToken = (payload) => {
  const token = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  // Вычисляем время истечения токена в миллисекундах
  const decoded = jwt.decode(token);
  const expiresIn = decoded.exp * 1000; // Конвертируем в миллисекунды

  return { token, expiresIn };
};

/**
 * Генерирует refresh токен
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * Генерирует пару токенов (access и refresh)
 * @returns {Object} { token, refreshToken, tokenExpires }
 */
const generateTokenPair = (payload) => {
  const { token, expiresIn } = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    token,
    refreshToken,
    tokenExpires: expiresIn,
  };
};

/**
 * Верифицирует access токен
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Верифицирует refresh токен
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
};
