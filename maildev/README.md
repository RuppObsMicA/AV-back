# Maildev Service

Отдельный сервис Maildev для деплоя на Railway.com

## 🚀 Деплой на Railway

### Быстрый старт

1. **Создайте новый проект на Railway:**
   - Зайдите на [railway.com](https://railway.com)
   - Нажмите **"New Project"**
   - Выберите **"Empty Project"**

2. **Добавьте сервис:**
   - Нажмите **"+ New"** → **"GitHub Repo"** (если хотите деплоить из GitHub)
   - Или **"+ New"** → **"Empty Service"** → **"Deploy from GitHub repo"**
   - Выберите репозиторий и укажите путь: `maildev/`

3. **Настройте Dockerfile:**
   - Railway автоматически найдет `Dockerfile` в директории `maildev/`
   - Или в настройках сервиса укажите: **Dockerfile Path** = `maildev/Dockerfile`

4. **Настройте порты:**
   - В настройках сервиса → **"Networking"**
   - Добавьте порты:
     - `1025` - SMTP сервер
     - `1080` - Web интерфейс

5. **Создайте публичный домен (опционально):**
   - Для Web интерфейса (порт 1080) можно создать публичный домен
   - В настройках → **"Networking"** → **"Generate Domain"** для порта 1080

## 🔗 Подключение к бэкенду

После деплоя Maildev, в основном бэкенде установите переменные окружения:

```env
MAILDEV_HOST=maildev.railway.internal
MAILDEV_PORT=1025
```

**Как узнать hostname:**
- В Railway UI откройте сервис Maildev
- Перейдите в **"Settings"** → **"Networking"**
- Найдите **"Private Network"** hostname
- Обычно это `{service-name}.railway.internal`

## 📧 Использование

### SMTP сервер
- **Host:** `maildev.railway.internal` (внутренний) или публичный домен
- **Port:** `1025`
- **Auth:** не требуется

### Web интерфейс
- **URL:** `https://your-maildev-domain.railway.app` (если создали публичный домен)
- Или используйте Railway предоставленный домен

## 🔧 Локальный запуск

Для тестирования локально:

```bash
# Через Docker
docker run -d -p 1025:1025 -p 1080:1080 --name maildev maildev/maildev

# Или через npm (если установлен глобально)
maildev
```

## 📝 Переменные окружения (опционально)

Можно настроить в Railway:
- `MAILDEV_WEB_PORT=1080` - порт Web интерфейса
- `MAILDEV_SMTP_PORT=1025` - порт SMTP сервера

## ✅ Проверка работы

После деплоя проверьте:

```bash
# Web интерфейс
curl https://your-maildev-domain.railway.app

# SMTP (если доступен публично)
telnet your-maildev-domain.railway.app 1025
```

