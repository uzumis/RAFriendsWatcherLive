@echo off
setlocal

REM Caminho do repositório (pode ser ajustado se necessário)
set REPO_DIR=%cd%

cd /d "%REPO_DIR%"

REM Busca atualizações da branch main do repositório remoto
git fetch origin main

REM Restaura todos os arquivos para o estado exato da origem (main)
git reset --hard origin/main
git clean -fd

echo Sincronização concluída. Seu diretório está igual ao remoto (main).
pause