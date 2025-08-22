@echo off
setlocal enabledelayedexpansion

:: Verifica e cria arquivos JSON necessários
set JSONFILES=userData.json chievoData.json players.json
for %%F in (%JSONFILES%) do (
    if not exist "%%F" (
        echo [] > "%%F"
        echo Arquivo %%F criado com conteúdo []
    )
)

:: Verifica se o Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo NodeJS não encontrado. Instale manualmente em: https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi
    pause
    exit /b 1
)

:: Atualiza o PATH para reconhecer o Node.js recém-instalado
set PATH=%PATH%;C:\Program Files\nodejs\

:: Define o diretório e a página inicial
set DIR=%cd%
set PAGE=checkHistory.html

:: Verifica se o arquivo existe
if not exist "%DIR%\%PAGE%" (
    echo Arquivo %PAGE% não encontrado no diretório %DIR%
    pause
    exit /b 1
)

:: Inicia o backend Express
echo Iniciando backend Express...
start "" "http://localhost:1337/checkHistory.html"
node Service/app.js

echo ==========================================
echo  Acesse: http://localhost:1337/checkHistory.html
echo ==========================================
echo PARA FECHAR O SERVIDOR, USE CTRL+C
pause