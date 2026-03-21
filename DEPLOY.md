# Деплой ceramichedamario.it

## Архитектура

```
GitHub push → POST https://ceramichedamario.it/webhook
  → Caddy reverse_proxy → localhost:9000
  → webhook-server.mjs (проверка HMAC-SHA256)
  → deploy.sh (git pull, npm ci, build, atomic symlink swap)
  → Caddy раздаёт dist-live/ (симлинк на последний билд)
```

Сайт — статический Astro, билд ~4 сек, ~159 страниц. Деплой полностью автоматический при пуше в `main`.

---

## Что лежит в репо

| Файл | Назначение |
|---|---|
| `scripts/webhook-server.mjs` | HTTP-сервер, слушает вебхук от GitHub, проверяет подпись, запускает деплой |
| `scripts/deploy.sh` | Скрипт деплоя: pull, install, build, atomic swap симлинка, cleanup старых билдов |

---

## Настройка VPS

### 1. Генерация секрета

```bash
openssl rand -hex 32
```

Сохранить — понадобится и на VPS, и в настройках вебхука на GitHub.

### 2. Env-файл

```bash
mkdir -p ~/.config
echo 'WEBHOOK_SECRET=62f41c3abf476798b7642ae708ec9933cebbd6a73403e7c18bb592e9f8958e02' > ~/.config/ceramichedamario-webhook.env
echo 'PORT=9000' >> ~/.config/ceramichedamario-webhook.env
chmod 600 ~/.config/ceramichedamario-webhook.env
```

### 3. Первый билд

```bash
cd ~/ceramichedamario
git pull
npm ci
npx astro build --outDir dist-$(date +%s)
ln -sfn $(ls -dt dist-[0-9]* | head -1) dist-live
chmod +x scripts/deploy.sh
```

### 4. Caddyfile

Файл: `/etc/caddy/Caddyfile`

```caddyfile
ceramichedamario.it {
    handle /webhook {
        reverse_proxy 127.0.0.1:9000
    }

    # WordPress redirects
    @product_category path_regexp pc ^/product-category/(.*)$
    redir @product_category /shop/{re.pc.1} 301

    @product path_regexp pr ^/product/(.*)$
    redir @product /shop/{re.pr.1} 301

    @categoria path_regexp ci ^/categoria-prodotto/(.*)$
    redir @categoria /shop/{re.ci.1} 301

    redir /cart /shop 301
    redir /checkout /shop 301
    redir /my-account /contact 301
    redir /home / 301

    handle {
        root * /home/greg/ceramichedamario/dist-live
        try_files {path} {path}/index.html {path}.html
        file_server
    }

    handle_errors {
        @404 expression {err.status_code} == 404
        rewrite @404 /404.html
        root * /home/greg/ceramichedamario/dist-live
        file_server
    }

    @hashed path /_astro/*
    header @hashed Cache-Control "public, max-age=31536000, immutable"

    encode gzip zstd
}

www.ceramichedamario.it {
    redir https://ceramichedamario.it{uri} 301
}
```

Применить:

```bash
sudo nano /etc/caddy/Caddyfile   # вставить конфиг выше
sudo systemctl reload caddy
```

### 5. Systemd-сервис

Файл: `/etc/systemd/system/ceramichedamario-webhook.service`

```ini
[Unit]
Description=Ceramiche Da Mario Webhook Server
After=network.target

[Service]
Type=simple
User=greg
WorkingDirectory=/home/greg/ceramichedamario
ExecStart=/usr/bin/node scripts/webhook-server.mjs
EnvironmentFile=/home/greg/.config/ceramichedamario-webhook.env
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Установить:

```bash
sudo cp ceramichedamario-webhook.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now ceramichedamario-webhook
```

### 6. Проверка

```bash
journalctl -u ceramichedamario-webhook -f
```

---

## Настройка GitHub Webhook

Страница: `https://github.com/ungattocinereo/ceramichedamario/settings/hooks` → **Add webhook**

| Параметр | Значение |
|---|---|
| **Payload URL** | `https://ceramichedamario.it/webhook` |
| **Content type** | `application/json` |
| **Secret** | тот же секрет что на VPS |
| **SSL verification** | Enable |
| **Events** | Just the push event |
| **Active** | ✓ |

---

## Проверка работы

1. При создании вебхука GitHub пришлёт `ping` — в логах должен быть `pong`
2. Тестовый коммит и пуш → `journalctl -u ceramichedamario-webhook -f`
3. Сайт обновился → `curl -I https://ceramichedamario.it`

## Откат

Если нужно вернуть предыдущую версию:

```bash
# Посмотреть доступные билды
ls -dt ~/ceramichedamario/dist-[0-9]*

# Переключить на предыдущий
ln -sfn /home/greg/ceramichedamario/dist-ПРЕДЫДУЩИЙ dist-live
```

Caddy подхватит изменение автоматически, перезагрузка не нужна.
