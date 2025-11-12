const express = require('express');
const router = express.Router();

// Подключение роутов версии 1
const authRoutes = require('./auth');
const testRoutes = require('./test');
const languagesRoutes = require('./languages');

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    database: 'connected',
  });
});

// Роуты авторизации
router.use('/auth', authRoutes);

// Роуты языков
router.use('/auth/language-options', languagesRoutes);

// Роуты для тестирования (только в режиме разработки)
router.use('/test', testRoutes);

module.exports = router;
