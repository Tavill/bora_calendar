#!/bin/bash
# Запустить один раз после деплоя:
# bash set_webhook.sh YOUR_BOT_TOKEN
curl "https://api.telegram.org/bot$1/setWebhook?url=https://bora-calendar.vercel.app/bot"
