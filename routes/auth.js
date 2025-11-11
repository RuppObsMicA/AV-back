const express = require('express');
const router = express.Router();
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');

// Простое хранилище пользователей в памяти (в продакшене использовать БД)
const users = [];

/**
 * POST /api/auth/register
 * Регистрация нового пользователя (только email)
 */
router.post('/register', async (req, res) => {
  try {
    const { email } = req.body;

    // Валидация email
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Проверка, существует ли пользователь
    const existingUser = users.find(u => u.email === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Создание нового пользователя
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Генерация токенов
    const tokens = generateTokenPair({ 
      userId: newUser.id, 
      email: newUser.email 
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email
      },
      ...tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Вход пользователя (только email)
 */
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    // Валидация email
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Поиск пользователя
    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email' });
    }

    // Генерация токенов
    const tokens = generateTokenPair({ 
      userId: user.id, 
      email: user.email 
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email
      },
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/refresh
 * Обновление access токена с помощью refresh токена
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Верификация refresh токена
    const decoded = verifyRefreshToken(refreshToken);

    // Проверка существования пользователя
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Генерация нового access токена
    const { generateAccessToken } = require('../utils/jwt');
    const newAccessToken = generateAccessToken({ 
      userId: user.id, 
      email: user.email 
    });

    res.json({
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ error: error.message });
  }
});

module.exports = router;

