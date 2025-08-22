@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo      RetroAchievementsGroupWatcher
echo            Versão 1.0
echo ==========================================

:: Verifica e cria arquivos JSON necessários
set JSONFILES=userData.json chievoData.json players.json
for %%F in (%JSONFILES%) do (
    if not exist "%%F" (
        echo [] > "%%F"
        echo Arquivo %%F criado com conteúdo []
    )
)

:: Verifica se o arquivo .env existe
if not exist ".env" (
    echo ==========================================
    echo Arquivo .env NAO encontrado!
    echo Informe o usuario RetroAchievements:
    set /p USERNAME=
    echo Informe a chave da API RetroAchievements:
    set /p APIKEY=
    echo username=!USERNAME!> .env
    echo webApiKey=!APIKEY!>> .env
    echo ==========================================
    echo Arquivo .env criado com sucesso!
)

:: Verifica se o Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo NodeJS nao encontrado. Instale manualmente em: https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi
    pause
    exit /b 1
)

:: Atualiza o PATH para reconhecer o Node.js recém-instalado
set PATH=%PATH%;C:\Program Files\nodejs\

:: Verifica se node_modules existe, se não existir, instala
if not exist "node_modules" (
    echo node_modules nao encontrado. Instalando dependencias...
    start /wait "" "%~dp0installnode.cmd"
    if not exist "node_modules" (
        echo Falha na instalacao das dependencias. Reabrindo o programa...
        start "" "%~dpnx0"
        exit /b
    )
    echo Dependencias instaladas com sucesso!
)


:: Define o diretório e a página inicial
set DIR=%cd%
set PAGE=checkHistory.html

:: Verifica se o arquivo existe
if not exist "%DIR%\%PAGE%" (
    echo Arquivo %PAGE% nao encontrado no diretorio %DIR%
    pause
    exit /b 1
)

echo ==========================================
echo  Servidor iniciado. Acesse: http://localhost:1337/%PAGE%
echo ==========================================
echo PARA FECHAR O SERVIDOR, PRESSIONE CTRL+C
echo ==========================================

:: Inicia o backend Express e abre o navegador
start "" "http://localhost:1337/%PAGE%"
node Service/app.js

pause