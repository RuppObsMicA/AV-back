const mongoose = require('mongoose');
const { getNextSequenceValue } = require('../utils/sequence');

/**
 * Схема языка
 */
const languageSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Название языка обязательно'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Код языка обязателен'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 5, // Например, 'en', 'ru', 'en-US'
    },
    direction: {
      type: String,
      enum: ['ltr', 'rtl'],
      default: 'ltr',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Индексы
languageSchema.index({ id: 1 });
languageSchema.index({ code: 1 });

// Pre-save hook для автоматической генерации ID
languageSchema.pre('save', async function (next) {
  if (!this.id) {
    try {
      this.id = await getNextSequenceValue('languageId');
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Метод для преобразования в JSON
languageSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return {
    id: obj.id,
    name: obj.name,
    code: obj.code,
    direction: obj.direction,
    __entity: 'Language',
  };
};

const Language = mongoose.model('Language', languageSchema);

module.exports = Language;
