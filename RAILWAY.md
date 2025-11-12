# Деплой на Railway.com

## 🚀 Деплой бэкенда и Maildev на Railway

Railway позволяет запускать несколько сервисов в одном проекте. Это идеально для запуска бэкенда и Maildev отдельно.

## 📋 Шаги деплоя

### 1. Подготовка проекта

Убедитесь, что все файлы закоммичены:

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push
```

### 2. Создание проекта на Railway

1. Зайдите на [railway.com](https://railway.com)
2. Создайте новый проект или откройте существующий
3. Подключите GitHub репозиторий

### 3. Настройка сервиса бэкенда

1. **Добавьте сервис "GitHub Repo"** (если еще не добавлен)
2. Выберите ваш репозиторий `av-backend`
3. Railway автоматически определит Node.js проект

**Настройте переменные окружения:**

- `PORT` - Railway автоматически установит, но можно указать явно
- `MONGO_DB_URL` - ваша MongoDB строка подключения
- `ACCESS_TOKEN_SECRET` - секретный ключ для JWT
- `REFRESH_TOKEN_SECRET` - секретный ключ для JWT
- `FRONTEND_URL` - URL вашего фронтенда
- `MAILDEV_HOST` - будет установлен после создания Maildev сервиса (см. ниже)

### 4. Создание сервиса Maildev

1. В том же проекте Railway нажмите **"+ New"** → **"Empty Service"**
2. Назовите сервис `maildev` (или любое другое имя)
3. В настройках сервиса:
   - **Source**: выберите тот же репозиторий `av-backend`
   - **Root Directory**: оставьте пустым
   - **Dockerfile Path**: укажите `Dockerfile.maildev` (Railway найдет его автоматически)
   - Или в настройках сервиса выберите **"Use Dockerfile"** и укажите путь `Dockerfile.maildev`

4. **Настройте порты:**
   - Railway автоматически определит порты из Dockerfile (1025, 1080)
   - Или настройте вручную в разделе **"Settings"** → **"Networking"**
   - Добавьте порты: `1025` (SMTP) и `1080` (Web интерфейс)

### 5. Настройка переменных окружения для Maildev

В сервисе Maildev добавьте переменные (опционально):

- `MAILDEV_WEB_PORT=1080`
- `MAILDEV_SMTP_PORT=1025`

### 6. Получение URL Maildev

После деплоя Maildev:

1. Перейдите в настройки сервиса Maildev
2. Откройте вкладку **"Networking"**
3. Для Web интерфейса (порт 1080):
   - Создайте **Public Domain** (опционально, для доступа из браузера)
   - Или используйте Railway предоставленный домен
4. Для SMTP (порт 1025):
   - Используйте **Private Network Hostname** (рекомендуется)
   - Формат: `maildev.railway.internal` или `${{MAILDEV_SERVICE_NAME}}.railway.internal`
   - Railway автоматически создаст переменную окружения с hostname

**Как найти hostname:**

- В настройках сервиса Maildev → **"Variables"**
- Railway автоматически создаст переменную типа `MAILDEV_PRIVATE_HOSTNAME` или подобную
- Или используйте имя сервиса: если сервис называется `maildev`, то hostname будет `maildev.railway.internal`

### 7. Обновление переменных окружения бэкенда

В сервисе бэкенда добавьте/обновите переменные:

- `MAILDEV_HOST=maildev.railway.internal` (замените `maildev` на имя вашего сервиса Maildev)
- `MAILDEV_PORT=1025`

**Как узнать правильный hostname:**

1. В Railway UI откройте сервис Maildev
2. Перейдите в **"Settings"** → **"Networking"**
3. Найдите **"Private Network"** или **"Service Hostname"**
4. Обычно это `{service-name}.railway.internal`

**Важно:**

- Используйте внутренний hostname (`*.railway.internal`) для SMTP - это быстрее и безопаснее
- Если сервис называется `maildev`, hostname будет `maildev.railway.internal`
- Порт всегда `1025` для SMTP

### 8. Альтернативный способ: Docker Compose (если Railway поддерживает)

Если Railway поддерживает docker-compose, можно использовать `docker-compose.maildev.yml`, но обычно проще использовать отдельные сервисы.

## 🔧 Проверка деплоя

### Проверка бэкенда:

```bash
curl https://your-backend.railway.app/api/v1/health
```

### Проверка Maildev:

```bash
# Web интерфейс
curl https://maildev.railway.app

# SMTP (если открыт публично)
telnet maildev.railway.app 1025
```

## 📝 Важные замечания

1. **Внутренняя сеть Railway:**
   - Сервисы в одном проекте могут общаться через `*.railway.internal`
   - Это быстрее и безопаснее, чем публичные домены

2. **Переменные окружения:**
   - Можно настроить общие переменные для всех сервисов
   - Или индивидуальные для каждого сервиса

3. **Логи:**
   - Логи каждого сервиса доступны отдельно
   - Удобно для отладки

4. **Масштабирование:**
   - Каждый сервис масштабируется независимо
   - Можно отключить Maildev в продакшене, если не нужен

## 🎯 Быстрый старт

1. Создайте проект на Railway
2. Добавьте сервис бэкенда (GitHub Repo)
3. Добавьте сервис Maildev (Empty Service с Dockerfile.maildev)
4. Настройте переменные окружения
5. Деплой произойдет автоматически!

## 🔄 Обновление

При каждом push в GitHub Railway автоматически передеплоит оба сервиса.
