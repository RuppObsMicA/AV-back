const nodemailer = require('nodemailer');

/**
 * Создание транспорта для отправки email
 * В режиме разработки использует Maildev (localhost:1025)
 * В продакшене использует реальный SMTP сервер
 */
const createTransporter = () => {
  // Если указан MAILDEV_HOST, используем Maildev (для разработки или отдельного деплоя)
  if (process.env.MAILDEV_HOST) {
    return nodemailer.createTransport({
      host: process.env.MAILDEV_HOST,
      port: parseInt(process.env.MAILDEV_PORT || '1025', 10),
      secure: false, // Maildev не использует SSL
      auth: false, // Maildev не требует аутентификации
    });
  }

  // Продакшен конфигурация (используйте реальный SMTP)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback на localhost Maildev для разработки
  return nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false,
    auth: false,
  });
};

/**
 * Отправка email
 * @param {Object} options - Опции для отправки
 * @param {string} options.to - Email получателя
 * @param {string} options.subject - Тема письма
 * @param {string} options.text - Текст письма (plain text)
 * @param {string} options.html - HTML версия письма (опционально)
 * @param {string} options.from - Email отправителя (по умолчанию из env)
 */
const sendEmail = async ({ to, subject, text, html, from }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: from || process.env.EMAIL_FROM || 'noreply@example.com',
      to,
      subject,
      text,
      html: html || text, // Если HTML не указан, используем text
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email отправлен:', {
      messageId: info.messageId,
      to,
      subject,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Ошибка отправки email:', error);
    throw new Error(`Не удалось отправить email: ${error.message}`);
  }
};

/**
 * Отправка email для подтверждения регистрации
 * @param {Object} user - Объект пользователя
 * @param {string} hash - Хеш для подтверждения
 */
const sendRegistrationConfirmationEmail = async (user, hash) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  const confirmationUrl = `${frontendUrl}/auth/setPassword?hash=${hash}`;

  return sendEmail({
    to: user.email,
    subject: 'Подтвердите регистрацию',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Добро пожаловать!</h2>
        <p>Спасибо за регистрацию. Для завершения регистрации нажмите на кнопку ниже:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Подтвердить регистрацию
          </a>
        </div>
        <p style="color: #666; font-size: 12px;">
          Или скопируйте и вставьте эту ссылку в браузер:<br>
          <a href="${confirmationUrl}">${confirmationUrl}</a>
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Если вы не регистрировались, проигнорируйте это письмо.
        </p>
      </div>
    `,
    text: `Добро пожаловать! Подтвердите регистрацию, перейдя по ссылке: ${confirmationUrl}`,
  });
};

module.exports = {
  sendEmail,
  sendRegistrationConfirmationEmail,
  createTransporter,
};
