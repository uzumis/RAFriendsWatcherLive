#!/bin/bash
# start.sh - Inicializa RAFriendsWatcherLive em distros Linux

set -e

# Cria arquivos JSON necessários, se não existirem
for f in userData.json chievoData.json players.json; do
  if [ ! -f "$f" ]; then
    echo "[]" > "$f"
    echo "Arquivo $f criado com conteúdo []"
  fi
done

# Verifica se .env existe
if [ ! -f .env ]; then
  echo "=========================================="
  echo ".env NÃO encontrado!"
  read -p "Informe o usuario RetroAchievements: " RA_USERNAME
  read -p "Informe a chave da API RetroAchievements: " APIKEY
  echo "ra_username=$RA_USERNAME" > .env
  echo "webApiKey=$APIKEY" >> .env
  echo "=========================================="
  echo ".env criado com sucesso!"
fi

# Verifica se Node.js está instalado
if ! command -v node >/dev/null 2>&1; then
  echo "NodeJS não encontrado. Instale manualmente em: https://nodejs.org/"
  exit 1
fi

# Instala dependências se necessário
bash ./installnode.sh

PAGE=checkHistory.html
if [ ! -f "$PAGE" ]; then
  echo "Arquivo $PAGE não encontrado no diretório $(pwd)"
  exit 1
fi

# Inicia o backend Express e abre o navegador padrão
xdg-open "http://localhost:1337/$PAGE" 2>/dev/null || echo "Acesse: http://localhost:1337/$PAGE"
node Service/app.js
