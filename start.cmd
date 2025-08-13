@echo off
setlocal enabledelayedexpansion

:: Checa e atualiza a branch release se houver mudanças
echo Verificando atualizações na branch release do GitHub...
git fetch origin release
git diff --quiet release origin/release
if not %errorlevel%==0 (
    echo Atualizações encontradas! Atualizando arquivos...
    git merge origin/release
    echo Atualização concluída!
) else (
    echo Nenhuma atualização encontrada na branch release.
)

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
    where node >nul 2>nul
    if %errorlevel% neq 0 (
        echo NodeJS não encontrado. Instale manualmente em: https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi
        pause
        exit /b 1
    )
)

:: Atualiza o PATH para reconhecer o Node.js recém-instalado
set PATH=%PATH%;C:\Program Files\nodejs\

:: Verifica se o live-server está instalado
where live-server >nul 2>nul
if %errorlevel% neq 0 (
    echo live-server não encontrado. Instalando... abra novamente se ele fechar sozinho
    npm install -g live-server
)

:: Define o diretório e a página inicial
set DIR=%cd%
set PAGE=/checkHistory.html

:: Verifica se o arquivo existe
if not exist "%DIR%\%PAGE%" (
    echo Arquivo %PAGE% não encontrado no diretório %DIR%
    pause
    exit /b 1
)

:: Define a porta do servidor (opcional, padrão: 5500)
set PORT=5500

:: Inicia o backend (node controller/server.js) em paralelo
echo Iniciando backend...
start "" node Service/app.js

:: Exibe informações do live-server
echo ==========================================
echo  Iniciando Live Server...
echo  Acesse: http://localhost:%PORT%/%PAGE%
echo ==========================================
@echo off
echo PARA FECHAR O SERVIDOR, USE CTRL+C
echo 

:: Inicia o live-server e mantém o terminal aberto
live-server "%DIR%" --port=%PORT% --open="%PAGE%" --ignore="userData.json,chievoData.json,players.json, widgetConquistas.html" --no-browser --host=localhost --port=%PORT% --entry-file="%PAGE%" --watch="."

:: Mantém a janela aberta
pause