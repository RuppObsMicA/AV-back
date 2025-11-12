const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getNextSequenceValue } = require('../utils/sequence');

/**
 * Схема пользователя
 */
const userSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email обязателен'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Некорректный формат email'],
    },
    password: {
      type: String,
      select: false, // Не возвращать пароль по умолчанию
    },
    verificationHash: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      default: 'email',
    },
    socialId: {
      type: String,
      default: null,
    },
    firstName: {
      type: String,
      default: null,
    },
    lastName: {
      type: String,
      default: null,
    },
    newEmail: {
      type: String,
      default: null,
    },
    dateBirth: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isTwoFAEnabled: {
      type: Boolean,
      default: false,
    },
    directoryId: {
      type: Number,
      default: null,
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
    timestamps: true, // Автоматически обновляет createdAt и updatedAt
    versionKey: false, // Убираем поле __v
  }
);

// Индекс для быстрого поиска по email
userSchema.index({ email: 1 });
// Индекс для быстрого поиска по id
userSchema.index({ id: 1 });
// Индекс для поиска по verificationHash
userSchema.index({ verificationHash: 1 });

// Pre-save hook для автоматической генерации ID
userSchema.pre('save', async function (next) {
  // Генерируем ID только если его еще нет (новый документ)
  if (!this.id) {
    try {
      this.id = await getNextSequenceValue('userId');
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Метод для хеширования пароля
userSchema.methods.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Метод для проверки пароля
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Метод для преобразования в JSON (полная структура для ответа логина)
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  const title = obj.firstName && obj.lastName ? `${obj.firstName} ${obj.lastName}` : obj.email;

  return {
    id: obj.id,
    email: obj.email,
    provider: obj.provider || 'email',
    socialId: obj.socialId || null,
    firstName: obj.firstName || null,
    lastName: obj.lastName || null,
    newEmail: obj.newEmail || null,
    dateBirth: obj.dateBirth || null,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    deletedAt: obj.deletedAt || null,
    isTwoFAEnabled: obj.isTwoFAEnabled || false,
    directoryId: obj.directoryId || null,
    organization: null,
    photo: null,
    inputLanguage: null,
    outputLanguage: null,
    department: null,
    status: {
      id: 1,
      name: 'Active',
      __entity: 'Status',
    },
    role: {
      id: 2,
      name: 'normal',
      description: 'normal user of the system',
      __entity: 'RoleEntity',
    },
    subscribePlan: null,
    __entity: 'User',
    title: title,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
