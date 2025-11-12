const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { generateTokenPair, verifyRefreshToken, generateAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const { sendRegistrationConfirmationEmail } = require('../services/email');

/**
 * POST /api/v1/auth/register
 * Регистрация нового пользователя (только email)
 */
router.post('/email/register', async (req, res) => {
  try {
    const { email } = req.body;

    // Валидация email
    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
        code: 'EMAIL_REQUIRED',
      });
    }

    // Mongoose автоматически валидирует email через схему
    // Но добавим дополнительную проверку для лучшего UX
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL_FORMAT',
      });
    }

    // Проверка, существует ли пользователь
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists',
        code: 'USER_ALREADY_EXISTS',
      });
    }

    // Генерация уникального hash для подтверждения регистрации
    const verificationHash = crypto.randomBytes(32).toString('hex');

    // Создание нового пользователя
    const newUser = await User.create({
      email: email.toLowerCase(),
      verificationHash,
      isVerified: false,
    });

    // Отправка письма с подтверждением регистрации
    try {
      await sendRegistrationConfirmationEmail(newUser, verificationHash);
    } catch (emailError) {
      console.error('Ошибка отправки email:', emailError);
      // Не прерываем регистрацию, если email не отправился
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email to confirm registration.',
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Обработка ошибок валидации Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: Object.values(error.errors)
          .map((e) => e.message)
          .join(', '),
        code: 'VALIDATION_ERROR',
      });
    }

    // Обработка ошибки дублирования (если уникальный индекс не сработал)
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'User with this email already exists',
        code: 'USER_ALREADY_EXISTS',
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * POST /api/v1/auth/login
 * Вход пользователя (email и password)
 */
router.post('/email/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Валидация
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'CREDENTIALS_REQUIRED',
      });
    }

    // Поиск пользователя в базе данных (включая пароль)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Проверка пароля
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Проверка подтверждения регистрации
    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    // Генерация токенов (используем числовой id)
    const tokens = generateTokenPair({
      userId: user.id.toString(),
      email: user.email,
    });

    res.json({
      refreshToken: tokens.refreshToken,
      token: tokens.token,
      tokenExpires: tokens.tokenExpires,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * POST /api/v1/auth/confirm
 * Подтверждение регистрации (установка пароля)
 */
router.post('/email/confirm', async (req, res) => {
  try {
    const { hash, password } = req.body;

    // Валидация
    if (!hash || !password) {
      return res.status(400).json({
        error: 'Hash and password are required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Проверка длины пароля
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT',
      });
    }

    // Поиск пользователя по hash
    const user = await User.findOne({ verificationHash: hash });
    if (!user) {
      return res.status(404).json({
        error: 'Invalid or expired confirmation hash',
        code: 'INVALID_HASH',
      });
    }

    // Проверка, не подтвержден ли уже пользователь
    if (user.isVerified) {
      return res.status(400).json({
        error: 'User is already verified',
        code: 'ALREADY_VERIFIED',
      });
    }

    // Хеширование пароля
    const hashedPassword = await user.hashPassword(password);

    // Обновление пользователя: установка пароля и подтверждение
    user.password = hashedPassword;
    user.isVerified = true;
    user.verificationHash = undefined; // Удаляем hash после использования
    await user.save();

    // Генерация токенов
    const tokens = generateTokenPair({
      userId: user.id.toString(),
      email: user.email,
    });

    res.json({
      refreshToken: tokens.refreshToken,
      token: tokens.token,
      tokenExpires: tokens.tokenExpires,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Confirmation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * POST /api/v1/auth/refresh
 * Обновление access токена с помощью refresh токена
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required',
        code: 'REFRESH_TOKEN_REQUIRED',
      });
    }

    // Верификация refresh токена
    const decoded = verifyRefreshToken(refreshToken);

    // Проверка существования пользователя в базе данных (по числовому id)
    const userId = parseInt(decoded.userId, 10);
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Генерация нового access токена
    const { token, expiresIn } = generateAccessToken({
      userId: user.id.toString(),
      email: user.email,
    });

    res.json({
      token: token,
      tokenExpires: expiresIn,
    });
  } catch (error) {
    console.error('Refresh token error:', error);

    // Обработка ошибок JWT
    if (error.message.includes('expired')) {
      return res.status(403).json({
        error: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED',
      });
    }

    if (error.message.includes('Invalid')) {
      return res.status(403).json({
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    res.status(403).json({
      error: error.message || 'Token verification failed',
      code: 'TOKEN_VERIFICATION_FAILED',
    });
  }
});

module.exports = router;
