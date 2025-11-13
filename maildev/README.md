# Maildev Service

Отдельный сервис Maildev для деплоя на Railway.com

## ⚠️ Важно: Настройка Root Directory

**Если получаете ошибку "Dockerfile does not exist":**

### Пошаговое решение:

1. В Railway UI откройте сервис Maildev
2. Перейдите в **"Settings"** (шестеренка в правом верхнем углу)
3. Найдите раздел **"Source"** или **"Repository"**
4. В поле **"Root Directory"** введите: `maildev`
   - ⚠️ **Важно:** Без слеша `/` в конце! Просто `maildev`
   - ⚠️ **Важно:** Не `maildev/`, не `/maildev`, а именно `maildev`
5. Нажмите **"Save"** или **"Update"**
6. Перезапустите деплой: нажмите **"Deploy"** или **"Redeploy"**

После этого Railway будет искать `Dockerfile` в директории `maildev/Dockerfile`.

### Если проблема сохраняется:

Используйте **альтернативный способ** (см. ниже) - деплой через готовый Docker образ без Dockerfile.

## 🚀 Деплой на Railway

### Быстрый старт

1. **Создайте новый проект на Railway:**
   - Зайдите на [railway.com](https://railway.com)
   - Нажмите **"New Project"**
   - Выберите **"Empty Project"**

2. **Добавьте сервис:**
   - Нажмите **"+ New"** → **"GitHub Repo"**
   - Выберите репозиторий `av-backend`

3. **Настройте Root Directory:**
   - В настройках сервиса перейдите в **"Settings"**
   - Найдите раздел **"Source"**
   - Установите **"Root Directory"** = `maildev`
   - Railway будет искать файлы в директории `maildev/`

4. **Настройте Builder:**
   - В настройках сервиса → **"Settings"** → **"Build & Deploy"**
   - Убедитесь, что выбран **"Dockerfile"** как builder
   - Railway автоматически найдет `Dockerfile` в директории `maildev/`
   - **Важно:** После установки Root Directory, Railway должен автоматически найти Dockerfile

5. **Настройте порты:**
   - В настройках сервиса → **"Networking"**
   - Добавьте порты:
     - `1025` - SMTP сервер
     - `1080` - Web интерфейс

6. **Создайте публичный домен (опционально):**
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

## 🔄 Альтернативный способ: Использование готового образа

Если Dockerfile не работает, можно использовать готовый образ напрямую:

1. В Railway UI откройте сервис Maildev
2. Перейдите в **"Settings"** → **"Build & Deploy"**
3. Выберите **"Use Docker Image"** вместо Dockerfile
4. Укажите образ: `maildev/maildev:latest`
5. Настройте порты: `1025` (SMTP) и `1080` (Web)
6. Сохраните и задеплойте

Этот способ проще и не требует Dockerfile.

## 🆘 Решение проблем

Если возникают проблемы, см. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
