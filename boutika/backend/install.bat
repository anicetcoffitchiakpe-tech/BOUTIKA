@echo off
REM ============================================================
REM  Boutika BACKEND (PHP) — Installation
REM  Crée la base MySQL et insère les données de démo.
REM ============================================================
setlocal
cd /d "%~dp0"

call ..\_find_php.bat
if errorlevel 1 exit /b 1

echo [boutika-php] PHP detecte :
php -v | findstr /i "php"
echo.

echo [boutika-php] Attente de MySQL sur 127.0.0.1:3306 ...
php -r "@fsockopen('127.0.0.1',3306,$e,$es,3); exit($es?1:0);" >nul 2>nul
if errorlevel 1 (
    echo [boutika-php] ERREUR : MySQL n'est pas demarre sur le port 3306.
    echo   Demarrez MySQL via XAMPP Control Panel puis relancez.
    pause
    exit /b 1
)
echo [boutika-php] MySQL detecte.
echo.

echo [boutika-php] Lancement de l'installation / seed ...
php scripts/install.php %*
if errorlevel 1 ( pause & exit /b 1 )

echo.
echo [boutika-php] Appuyez sur une touche pour fermer.
pause
