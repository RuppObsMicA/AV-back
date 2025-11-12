require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();
const port = process.env.PORT || 3000;

// CORS настройка
const corsOptions = {
  origin: function (origin, callback) {
    // Разрешаем запросы без origin (например, Postman, мобильные приложения)
    if (!origin) {
      return callback(null, true);
    }

    // Разрешенные origins
    const allowedOrigins = [
      /^http:\/\/localhost(:\d+)?$/, // localhost на любом порту
      /^http:\/\/127\.0\.0\.1(:\d+)?$/, // 127.0.0.1 на любом порту
      process.env.FRONTEND_URL, // URL из переменной окружения
    ].filter(Boolean); // Убираем undefined значения

    // Проверяем, разрешен ли origin
    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Разрешаем отправку cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Подключение к базе данных
connectDB();

// API v1 роуты (все роуты версии 1)
const v1Routes = require('./routes/v1');
app.use('/api/v1', v1Routes);

// Базовые роуты
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World!',
    timestamp: new Date().toISOString(),
  });
});

// Обработка ошибок
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
  });
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
