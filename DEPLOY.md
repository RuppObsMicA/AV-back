# Инструкции по деплою

## 📧 Деплой Maildev отдельно

Maildev можно задеплоить отдельно от основного приложения для использования в продакшене.

### Вариант 1: Docker (рекомендуется)

```bash
# Запуск Maildev в Docker
docker run -d \
  --name maildev \
  -p 1025:1025 \
  -p 1080:1080 \
  maildev/maildev

# Или с docker-compose
```

Создайте файл `docker-compose.maildev.yml`:

```yaml
version: '3.8'

services:
  maildev:
    image: maildev/maildev:latest
    container_name: maildev
    ports:
      - '1025:1025' # SMTP порт
      - '1080:1080' # Web интерфейс
    restart: unless-stopped
    environment:
      - MAILDEV_WEB_PORT=1080
      - MAILDEV_SMTP_PORT=1025
```

Запуск:

```bash
docker-compose -f docker-compose.maildev.yml up -d
```

### Вариант 2: PM2 на отдельном сервере

```bash
# Установка Maildev глобально
npm install -g maildev

# Запуск через PM2
pm2 start maildev --name maildev
pm2 save
```

### Вариант 3: Systemd service

Создайте файл `/etc/systemd/system/maildev.service`:

```ini
[Unit]
Description=Maildev SMTP Server
After=network.target

[Service]
Type=simple
User=your-user
ExecStart=/usr/bin/npx maildev
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Запуск:

```bash
sudo systemctl enable maildev
sudo systemctl start maildev
```

### Настройка переменных окружения

После деплоя Maildev обновите переменные окружения в основном приложении:

```env
# Если Maildev на том же сервере
MAILDEV_HOST=localhost
MAILDEV_PORT=1025

# Если Maildev на отдельном сервере
MAILDEV_HOST=maildev.yourdomain.com
MAILDEV_PORT=1025
```

## 🌱 Запуск seed скрипта на продакшн

### Безопасный способ

1. **Подготовка:**

   ```bash
   # Убедитесь, что у вас есть доступ к продакшн базе данных
   # Проверьте переменную окружения MONGO_DB_URL
   ```

2. **Запуск seed скрипта:**

   ```bash
   # Локально с подключением к продакшн БД
   NODE_ENV=production MONGO_DB_URL=your-production-mongo-url node scripts/seedLanguages.prod.js

   # Или через npm скрипт
   NODE_ENV=production MONGO_DB_URL=your-production-mongo-url npm run seed:languages:prod
   ```

3. **Через SSH на сервере:**

   ```bash
   # Подключитесь к серверу
   ssh user@your-server.com

   # Перейдите в директорию проекта
   cd /path/to/av-backend

   # Запустите скрипт
   NODE_ENV=production node scripts/seedLanguages.prod.js
   ```

### Через npm скрипт

Добавьте в `package.json`:

```json
{
  "scripts": {
    "seed:languages:prod": "NODE_ENV=production node scripts/seedLanguages.prod.js"
  }
}
```

Запуск:

```bash
npm run seed:languages:prod
```

## ⚠️ Важные замечания

1. **Безопасность:**
   - Никогда не коммитьте продакшн credentials в git
   - Используйте переменные окружения
   - Проверяйте подключение перед запуском seed

2. **Резервное копирование:**
   - Сделайте бэкап базы данных перед запуском seed на продакшн
   - Seed скрипт не удаляет существующие данные, но лучше перестраховаться

3. **Проверка:**
   - Скрипт проверяет существование языков перед добавлением
   - Существующие языки не будут перезаписаны

## 🔍 Проверка после деплоя

### Проверка Maildev:

```bash
# Проверка SMTP порта
telnet maildev-host 1025

# Проверка Web интерфейса
curl http://maildev-host:1080
```

### Проверка языков в базе:

```bash
# Через MongoDB shell
mongo your-connection-string
> use your-database
> db.languages.find().pretty()

# Или через API
curl https://your-api.com/api/v1/auth/language-options
```
