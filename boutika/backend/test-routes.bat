@echo off
REM ============================================================
REM  Boutika BACKEND (PHP) — Teste toutes les routes (41 tests)
REM  L'API doit être démarrée (start-server.bat) dans une autre fenêtre.
REM ============================================================
setlocal
cd /d "%~dp0"

call ..\_find_php.bat
if errorlevel 1 exit /b 1

echo [boutika-php] ========================================
echo [boutika-php]   Test des routes API
echo [boutika-php] ========================================
echo.

echo [boutika-php] Verification que l'API repond ...
php -r "@fopen('http://localhost:5000/api/health','r') or exit(1);"
if errorlevel 1 (
    echo [boutika-php] ERREUR : l'API ne repond pas sur le port 5000.
    echo   Lancez d'abord start-server.bat dans une autre fenetre.
    pause
    exit /b 1
)

echo [boutika-php] API detectee. Lancement des tests ...
echo.
php tests/run-api-tests.php
echo.
pause
