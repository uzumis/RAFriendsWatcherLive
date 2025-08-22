:: Verifica se node_modules existe, se não existir, instala
if not exist "node_modules" (
    echo node_modules nao encontrado. Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo Erro durante npm install! Codigo de erro %errorlevel%.
        echo Verifique os logs acima.
        echo Reabrindo o programa...
        start "" "%~dpnx0"
        exit /b
    )
    echo Dependencias instaladas com sucesso!
     exit /b
)