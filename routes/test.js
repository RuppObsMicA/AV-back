const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/email');

/**
 * POST /api/v1/test/email
 * Эндпоинт для тестирования отправки email
 * Доступен только в режиме разработки
 */
router.post('/email', async (req, res) => {
  // Разрешаем только в режиме разработки
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'This endpoint is only available in development mode',
      code: 'FORBIDDEN',
    });
  }

  try {
    const { to, subject, text, html } = req.body;

    // Валидация
    if (!to || !subject) {
      return res.status(400).json({
        error: 'Email and subject are required',
        code: 'VALIDATION_ERROR',
        fields: {
          to: to ? 'valid' : 'required',
          subject: subject ? 'valid' : 'required',
        },
      });
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL',
      });
    }

    // Отправка email
    const result = await sendEmail({
      to,
      subject,
      text: text || 'Test email from AV Backend',
      html: html || text || '<p>Test email from AV Backend</p>',
    });

    res.json({
      message: 'Email sent successfully',
      result,
      info: {
        maildev: 'Check http://localhost:1080 to view the email',
        smtp: {
          host: process.env.MAILDEV_HOST || 'localhost',
          port: process.env.MAILDEV_PORT || 1025,
        },
      },
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      error: error.message || 'Failed to send test email',
      code: 'EMAIL_SEND_ERROR',
    });
  }
});

module.exports = router;
