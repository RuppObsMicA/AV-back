# AV Backend

Backend приложение на Node.js с Express, реализующее систему аутентификации через JWT токены (access и refresh токены).

## 🚀 Возможности

- ✅ Регистрация пользователей (только email)
- ✅ Авторизация пользователей
- ✅ JWT токены (access и refresh)
- ✅ Обновление access токена через refresh токен
- ✅ Middleware для защиты роутов

## 📋 Требования

- Node.js (версия 14 или выше)
- npm или yarn

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

### Производственный режим
```bash
npm start
```

Сервер запустится на порту, указанном в переменной окружения `PORT` (по умолчанию 3000).

## 📡 API Эндпоинты

### Общие эндпоинты

- `GET /` - Возвращает приветственное сообщение
- `GET /api/health` - Проверка состояния сервера

### Авторизация

#### Регистрация
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Ответ (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "1234567890",
    "email": "user@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Вход
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Ответ (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "1234567890",
    "email": "user@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Обновление токена
```http
POST /api/auth/refresh
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

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'This is a protected route',
    user: req.user 
  });
});
```

**Запрос к защищенному роуту:**
```http
GET /api/protected
Authorization: Bearer <accessToken>
```

## 📁 Структура проекта

```
av-backend/
├── index.js              # Главный файл сервера
├── package.json          # Конфигурация проекта
├── .env                  # Переменные окружения (не в git)
├── .env.example          # Пример переменных окружения
├── .gitignore            # Игнорируемые файлы для git
├── README.md             # Документация
├── middleware/
│   └── auth.js          # Middleware для проверки токенов
├── routes/
│   └── auth.js          # Роуты авторизации
└── utils/
    └── jwt.js           # Утилиты для работы с JWT
```

## 🔐 Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PORT` | Порт сервера | `3000` |
| `ACCESS_TOKEN_SECRET` | Секретный ключ для access токенов | - |
| `REFRESH_TOKEN_SECRET` | Секретный ключ для refresh токенов | - |
| `ACCESS_TOKEN_EXPIRY` | Время жизни access токена | `15m` |
| `REFRESH_TOKEN_EXPIRY` | Время жизни refresh токена | `7d` |

## 🛠 Технологии

- **Express.js** - веб-фреймворк
- **jsonwebtoken** - работа с JWT токенами
- **bcryptjs** - хеширование паролей (для будущего расширения)
- **dotenv** - управление переменными окружения

## 📝 Лицензия

ISC

## 🤝 Вклад

Pull requests приветствуются! Для больших изменений сначала откройте issue, чтобы обсудить, что вы хотите изменить.
