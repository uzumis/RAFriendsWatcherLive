#!/bin/bash
set -e

echo "=========================================="
echo "     RetroAchievementsGroupWatcher"
echo "              Versão 1.0"
echo "=========================================="

# Verifica e cria arquivos JSON necessários
JSONFILES=("userData.json" "chievoData.json" "players.json")
for FILE in "${JSONFILES[@]}"; do
    if [ ! -f "$FILE" ]; then
        echo "[]" > "$FILE"
        echo "Arquivo $FILE criado com conteúdo []"
    fi
done

# Verifica se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "=========================================="
    echo "Arquivo .env NÃO encontrado!"
    read -p "Informe o usuário RetroAchievements: " RA_USERNAME
    read -p "Informe a chave da API RetroAchievements: " APIKEY
    echo "ra_username=$RA_USERNAME" > .env
    echo "webApiKey=$APIKEY" >> .env
    echo "=========================================="
    echo "Arquivo .env criado com sucesso!"
fi

# Verifica se o Node.js está instalado
if ! command -v node >/dev/null 2>&1; then
    echo "NodeJS não encontrado."
    echo "Instale manualmente em: https://nodejs.org/"
    exit 1
fi

# Verifica se node_modules existe, se não existir, instala
if [ ! -d "node_modules" ]; then
    echo "node_modules não encontrado. Instalando dependências..."
    if [ -f "installnode.sh" ]; then
        bash installnode.sh
    elif [ -f "package.json" ]; then
        npm install
    else
        echo "Nenhum instalador ou package.json encontrado."
        exit 1
    fi

    if [ ! -d "node_modules" ]; then
        echo "Falha na instalação das dependências. Reabra o programa."
        exit 1
    fi

    echo "Dependências instaladas com sucesso!"
fi

# Define o diretório e a página inicial
DIR=$(pwd)
PAGE="checkHistory.html"

# Verifica se o arquivo existe
if [ ! -f "$DIR/$PAGE" ]; then
    echo "Arquivo $PAGE não encontrado no diretório $DIR"
    exit 1
fi

echo "=========================================="
echo "  Servidor iniciado. Acesse: http://localhost:1337/$PAGE"
echo "=========================================="
echo " PARA FECHAR O SERVIDOR, PRESSIONE CTRL+C"
echo "=========================================="

# Abre o navegador e inicia o backend
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:1337/$PAGE" >/dev/null 2>&1 &
elif command -v gnome-open >/dev/null 2>&1; then
    gnome-open "http://localhost:1337/$PAGE" >/dev/null 2>&1 &
else
    echo "Abra manualmente o link: http://localhost:1337/$PAGE"
fi

node service/app.js
