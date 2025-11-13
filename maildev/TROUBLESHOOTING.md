# Решение проблем с деплоем Maildev на Railway

## ❌ Ошибка: "Dockerfile does not exist"

### Решение 1: Проверьте Root Directory

1. В Railway UI откройте сервис Maildev
2. Перейдите в **"Settings"** → **"Source"**
3. Убедитесь, что **"Root Directory"** установлен в `maildev` (без слеша в конце)
4. Сохраните изменения
5. Перезапустите деплой

### Решение 2: Используйте готовый образ напрямую

Если Dockerfile не работает, можно использовать готовый образ:

1. В настройках сервиса → **"Settings"** → **"Build & Deploy"**
2. Выберите **"Use Docker Image"**
3. Укажите образ: `maildev/maildev:latest`
4. Настройте порты: `1025` и `1080`

### Решение 3: Проверьте структуру файлов

Убедитесь, что в репозитории есть файл:

```
av-backend/
  maildev/
    Dockerfile
```

Проверьте через GitHub, что файл действительно закоммичен.

### Решение 4: Используйте Nixpacks

Если Dockerfile не работает, Railway попробует использовать `nixpacks.toml`:

- Файл `nixpacks.toml` уже создан в директории `maildev/`
- Railway автоматически его использует, если Dockerfile не найден

## ✅ Проверка

После настройки Root Directory:

1. Railway должен автоматически найти `Dockerfile` в `maildev/Dockerfile`
2. В логах деплоя вы увидите: "Building Dockerfile..."
3. Если ошибка сохраняется, проверьте логи деплоя

## 🔄 Перезапуск деплоя

После изменения настроек:

1. В Railway UI нажмите **"Redeploy"** или **"Deploy"**
2. Или сделайте пустой коммит: `git commit --allow-empty -m "Trigger redeploy"`
