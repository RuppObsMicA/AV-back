require('dotenv').config();
const connectDB = require('../config/database');
const Language = require('../models/Language');

/**
 * Скрипт для заполнения базы данных языками
 */
const seedLanguages = async () => {
  try {
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

    // Удаляем существующие языки (опционально, можно закомментировать)
    // await Language.deleteMany({});
    // console.log('✅ Существующие языки удалены');

    // Добавляем языки
    for (const langData of languages) {
      // Проверяем, существует ли язык с таким кодом
      const existingLang = await Language.findOne({ code: langData.code });
      if (existingLang) {
        console.log(`⏭️  Язык ${langData.name} (${langData.code}) уже существует, пропускаем`);
        continue;
      }

      const language = new Language(langData);
      await language.save();
      console.log(`✅ Язык ${langData.name} (${langData.code}) добавлен с ID: ${language.id}`);
    }

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
