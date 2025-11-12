# AV Backend

Backend приложение на Node.js с Express, реализующее систему аутентификации через JWT токены (access и refresh токены).

## 🚀 Возможности

- ✅ Регистрация пользователей (только email)
- ✅ Авторизация пользователей
- ✅ JWT токены (access и refresh)
- ✅ Обновление access токена через refresh токен
- ✅ Middleware для защиты роутов
- ✅ MongoDB для хранения данных пользователей
- ✅ Обработка ошибок и валидация данных

## 📋 Требования

- Node.js (версия 14 или выше)
- npm или yarn
- MongoDB (локальная или облачная база данных)

## 🔧 Установка

1. Клонируйте репозиторий:

```bash
git clone <your-repo-url>
cd av-backend
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

4. Настройте переменные окружения в `.env`:
   - Укажите `MONGO_DB_URL` - строку подключения к MongoDB
   - Сгенерируйте безопасные секретные ключи для JWT:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

   - Замените `ACCESS_TOKEN_SECRET` и `REFRESH_TOKEN_SECRET` на сгенерированные значения

## 🏃 Запуск

### Режим разработки (с автоматическим перезапуском)

```bash
npm run dev
```

### Режим разработки с Maildev (для тестирования email)

```bash
# Запуск сервера и Maildev одновременно
npm run dev:full

# Или запустить Maildev отдельно в другом терминале
npm run maildev
npm run dev
```

**Maildev** - это локальный SMTP сервер для разработки. После запуска:

- SMTP сервер: `localhost:1025` (для отправки email)
- Web интерфейс: `http://localhost:1080` (для просмотра отправленных писем)

### Производственный режим

```bash
npm start
```

Сервер запустится на порту, указанном в переменной окружения `PORT` (по умолчанию 3000).

## 🔍 Линтинг и форматирование

Проект использует ESLint и Prettier для поддержания качества кода.

### Проверка кода

```bash
npm run lint          # Проверка ESLint
npm run lint:fix       # Автоматическое исправление ошибок ESLint
npm run format:check   # Проверка форматирования Prettier
npm run format         # Автоматическое форматирование кода
npm run check          # Проверка линтера и форматирования
```

## 🚀 CI/CD

Проект использует GitHub Actions для автоматической проверки кода при каждом push и pull request.

### Что проверяется:

- ✅ ESLint (проверка качества кода)
- ✅ Prettier (проверка форматирования)
- ✅ Тесты (если добавлены)
- ✅ Проверка запуска сервера

Workflow запускается автоматически при:

- Push в ветки `main` и `develop`
- Pull Request в ветки `main` и `develop`

## 📡 API Эндпоинты

### Общие эндпоинты

- `GET /` - Возвращает приветственное сообщение
- `GET /api/v1/health` - Проверка состояния сервера

### Авторизация

#### Регистрация

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Ответ (201):**

```json
{
  "message": "Registration successful. Please check your email to confirm registration.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "isVerified": false
  }
}
```

**Процесс регистрации:**

1. Пользователь отправляет email
2. На email приходит письмо с кнопкой подтверждения
3. При клике на кнопку происходит переход на фронтенд с hash в query параметрах
4. Фронтенд отправляет hash и password на эндпоинт `/api/v1/auth/confirm`

#### Подтверждение регистрации

```http
POST /api/v1/auth/confirm
Content-Type: application/json

{
  "hash": "abc123...",
  "password": "securePassword123"
}
```

**Ответ (200):**

```json
{
  "message": "Registration confirmed successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "isVerified": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Вход

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Ответ (200):**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "isVerified": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ошибки:**

- `EMAIL_NOT_VERIFIED` (403) - Email не подтвержден
- `INVALID_CREDENTIALS` (401) - Неверный email или пароль

#### Обновление токена

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ответ (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Использование защищенных роутов

Для защиты роутов используйте middleware `authenticateToken`:

```javascript
const { authenticateToken } = require('./middleware/auth');

app.get('/api/v1/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user,
  });
});
```

**Запрос к защищенному роуту:**

```http
GET /api/v1/protected
Authorization: Bearer <accessToken>
```

### Тестирование Email (только в режиме разработки)

#### Отправка тестового email

```http
POST /api/v1/test/email
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Test Email",
  "text": "This is a test email",
  "html": "<p>This is a <strong>test</strong> email</p>"
}
```

**Ответ (200):**

```json
{
  "message": "Email sent successfully",
  "result": {
    "success": true,
    "messageId": "..."
  },
  "info": {
    "maildev": "Check http://localhost:1080 to view the email",
    "smtp": {
      "host": "localhost",
      "port": 1025
    }
  }
}
```

**Как использовать:**

1. Запустите Maildev: `npm run maildev` или `npm run dev:full`
2. Откройте веб-интерфейс Maildev: `http://localhost:1080`
3. Отправьте тестовый email через API
4. Просмотрите письмо в веб-интерфейсе Maildev

**Важно:** Этот эндпоинт доступен только в режиме разработки (`NODE_ENV !== 'production'`).

## 📁 Структура проекта

```
av-backend/
├── index.js              # Главный файл сервера
├── package.json          # Конфигурация проекта
├── .env                  # Переменные окружения (не в git)
├── .env.example          # Пример переменных окружения
├── .gitignore            # Игнорируемые файлы для git
├── README.md             # Документация
├── config/
│   └── database.js      # Подключение к MongoDB
├── models/
│   └── User.js          # Модель пользователя
├── middleware/
│   └── auth.js          # Middleware для проверки токенов
├── routes/
│   ├── v1.js            # Роутер API версии 1 (централизованный)
│   ├── auth.js          # Роуты авторизации
│   └── test.js          # Роуты для тестирования (email и др.)
├── services/
│   └── email.js         # Сервис для отправки email
└── utils/
    ├── jwt.js           # Утилиты для работы с JWT
    └── sequence.js      # Утилиты для автоинкремента ID
```

## 🔐 Переменные окружения

| Переменная             | Описание                           | По умолчанию |
| ---------------------- | ---------------------------------- | ------------ |
| `PORT`                 | Порт сервера                       | `3000`       |
| `MONGO_DB_URL`         | Строка подключения к MongoDB       | -            |
| `ACCESS_TOKEN_SECRET`  | Секретный ключ для access токенов  | -            |
| `REFRESH_TOKEN_SECRET` | Секретный ключ для refresh токенов | -            |
| `ACCESS_TOKEN_EXPIRY`  | Время жизни access токена          | `15m`        |
| `REFRESH_TOKEN_EXPIRY` | Время жизни refresh токена         | `7d`         |
| `MAILDEV_HOST`         | Хост Maildev (для разработки)      | `localhost`  |
| `MAILDEV_PORT`         | Порт Maildev SMTP                  | `1025`       |
| `FRONTEND_URL`         | URL фронтенда (для ссылок в email) | -            |

## 🛠 Технологии

### Основные

- **Express.js** - веб-фреймворк
- **MongoDB** - NoSQL база данных
- **Mongoose** - ODM для MongoDB
- **jsonwebtoken** - работа с JWT токенами
- **bcryptjs** - хеширование паролей (для будущего расширения)
- **dotenv** - управление переменными окружения

### Инструменты разработки

- **ESLint** - линтер для проверки качества кода
- **Prettier** - форматирование кода
- **GitHub Actions** - CI/CD автоматизация
- **Maildev** - локальный SMTP сервер для тестирования email
- **Nodemailer** - отправка email

## 📝 Лицензия

ISC

## 🤝 Вклад

Pull requests приветствуются! Для больших изменений сначала откройте issue, чтобы обсудить, что вы хотите изменить.
