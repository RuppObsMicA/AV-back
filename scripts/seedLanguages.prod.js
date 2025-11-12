require('dotenv').config();
const connectDB = require('../config/database');
const Language = require('../models/Language');

/**
 * Скрипт для заполнения продакшн базы данных языками
 * Использование: NODE_ENV=production node scripts/seedLanguages.prod.js
 */
const seedLanguages = async () => {
  try {
    // Проверка окружения
    if (process.env.NODE_ENV !== 'production' && process.env.FORCE_PRODUCTION !== 'true') {
      console.warn('⚠️  Внимание: Скрипт запущен не в production режиме!');
      console.warn('⚠️  Для запуска на продакшн используйте:');
      console.warn('   NODE_ENV=production node scripts/seedLanguages.prod.js');
      console.warn('   или');
      console.warn('   FORCE_PRODUCTION=true node scripts/seedLanguages.prod.js');
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }

    // Проверка наличия MONGO_DB_URL
    if (!process.env.MONGO_DB_URL) {
      throw new Error('MONGO_DB_URL не установлена в переменных окружения');
    }

    console.log('🔗 Подключение к базе данных...');
    // Подключение к базе данных
    await connectDB();

    // Языки для заполнения
    const languages = [
      { name: 'English', code: 'EN', direction: 'ltr' },
      { name: 'Russian', code: 'RU', direction: 'ltr' },
      { name: 'Czech', code: 'CS', direction: 'ltr' },
      { name: 'Polish', code: 'PL', direction: 'ltr' },
      { name: 'Arabic', code: 'AR', direction: 'rtl' },
    ];

    console.log('🌱 Начинаем заполнение базы данных языками...');
    console.log(`📍 База данных: ${process.env.MONGO_DB_URL.replace(/:[^:@]+@/, ':****@')}`);

    // Добавляем языки
    let added = 0;
    let skipped = 0;

    for (const langData of languages) {
      // Проверяем, существует ли язык с таким кодом
      const existingLang = await Language.findOne({ code: langData.code });
      if (existingLang) {
        console.log(`⏭️  Язык ${langData.name} (${langData.code}) уже существует, пропускаем`);
        skipped++;
        continue;
      }

      const language = new Language(langData);
      await language.save();
      console.log(`✅ Язык ${langData.name} (${langData.code}) добавлен с ID: ${language.id}`);
      added++;
    }

    console.log('\n📊 Результаты:');
    console.log(`   ✅ Добавлено: ${added}`);
    console.log(`   ⏭️  Пропущено: ${skipped}`);
    console.log('🎉 Заполнение базы данных завершено!');
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
};

// Запуск скрипта
seedLanguages();
