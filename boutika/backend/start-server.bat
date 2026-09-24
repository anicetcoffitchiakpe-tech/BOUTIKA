@echo off
REM ============================================================
REM  Boutika BACKEND (PHP) — Démarre l'API sur http://localhost:5000
REM  (utilise le serveur built-in de PHP — pas besoin d'Apache)
REM ============================================================
setlocal
cd /d "%~dp0"

call ..\_find_php.bat
if errorlevel 1 exit /b 1

echo [boutika-php] Demarrage de l'API Boutika (PHP) ...
echo [boutika-php]   - Base : MySQL (localhost)
echo [boutika-php]   - Port : 5000
echo [boutika-php]   - Health : http://localhost:5000/api/health
echo [boutika-php]   - Images : http://localhost:5000/uploads/...
echo.
echo [boutika-php] Appuyez sur Ctrl+C pour arreter.
echo.

php -S 0.0.0.0:5000 -t public public/index.php
