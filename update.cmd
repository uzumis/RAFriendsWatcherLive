@echo off
setlocal

REM Caminho do repositório (pode ser ajustado se necessário)
set REPO_DIR=%cd%

cd /d "%REPO_DIR%"

REM Busca atualizações da branch main do repositório remoto
git fetch origin main

REM Verifica se há diferenças entre o branch local e o remoto main
git status -uno | findstr /C:"Your branch is up to date" >nul
if %errorlevel%==0 (
    echo Nenhuma atualização disponível.
    REM Garante que arquivos faltantes ou modificados sejam restaurados
    git reset --hard origin/main
    git clean -fd
    echo Arquivos restaurados para o estado da origem.
    goto end
)

git status -uno | findstr /C:"behind" >nul
if %errorlevel%==0 (
    echo Atualizações encontradas! Baixando da branch main...
    git pull origin main
    REM Garante que arquivos faltantes ou modificados sejam restaurados
    git reset --hard origin/main
    git clean -fd
    echo Atualização completa e arquivos sincronizados com a origem.
    goto end
)

echo Nenhuma atualização disponível.
REM Garante que arquivos faltantes ou modificados sejam restaurados
git reset --hard origin/main
git clean -fd
echo Arquivos restaurados para o estado da origem.

:end
pause