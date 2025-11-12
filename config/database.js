const mongoose = require('mongoose');

/**
 * Подключение к MongoDB
 * Использует переменную окружения MONGO_DB_URL или значение по умолчанию
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_DB_URL || process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGO_DB_URL не установлена в переменных окружения');
    }

    const conn = await mongoose.connect(mongoURI, {
      // Опции подключения для стабильности
      serverSelectionTimeoutMS: 5000, // Таймаут выбора сервера
      socketTimeoutMS: 45000, // Таймаут сокета
      maxPoolSize: 10, // Максимальное количество соединений в пуле
      minPoolSize: 5, // Минимальное количество соединений
      retryWrites: true, // Повторная запись при ошибках
    });

    console.log(`✅ MongoDB подключена: ${conn.connection.host}`);

    // Обработка событий подключения
    mongoose.connection.on('error', (err) => {
      console.error('❌ Ошибка подключения к MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB отключена');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB соединение закрыто через SIGINT');
      // eslint-disable-next-line no-process-exit
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    // В продакшене можно использовать более продвинутые стратегии повторных попыток
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
};

module.exports = connectDB;
