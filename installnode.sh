#!/bin/bash
# installnode.sh - Instala dependências Node.js para RAFriendsWatcherLive (Linux)

if [ ! -d "node_modules" ]; then
    echo "node_modules não encontrado. Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Erro durante npm install! Código de erro $?"
        echo "Verifique os logs acima."
        exit 1
    fi
    echo "Dependências instaladas com sucesso!"
fi
