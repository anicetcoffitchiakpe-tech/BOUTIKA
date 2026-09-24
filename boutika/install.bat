@echo off
REM ============================================================
REM  BOUTIKA - INSTALLATION UNIQUE
REM  Double-cliquez sur CE FICHIER une SEULE fois apres avoir
REM  decompresse le projet.
REM ============================================================
setlocal
cd /d "%~dp0"

chcp 65001 >nul
title Boutika - Installation

echo.
echo  ========================================================
echo      B O U T I K A  -  I N S T A L L A T I O N
echo  ========================================================
echo.

REM ---------- Trouver PHP ----------
set "PHP_EXE="
for %%d in (
  "C:\xampp\php"
  "D:\xampp\php"
  "E:\xampp\php"
  "C:\wamp64\bin\php\php8.2.0"
  "C:\wamp64\bin\php\php8.1.0"
  "C:\wamp64\bin\php\php8.0.0"
  "C:\wamp64\bin\php\php7.4.33"
  "C:\laragon\bin\php\php-8.2.0-Win32-vs16-x64"
) do (
  if exist "%%~d\php.exe" if not defined PHP_EXE set "PHP_EXE=%%~d\php.exe"
)

REM Chercher récursivement la version la plus récente dans WAMP
if not defined PHP_EXE if exist "C:\wamp64\bin\php" (
  for /f "delims=" %%d in ('dir /b /ad /o-n "C:\wamp64\bin\php" 2^>nul') do (
    if exist "C:\wamp64\bin\php\%%d\php.exe" if not defined PHP_EXE set "PHP_EXE=C:\wamp64\bin\php\%%d\php.exe"
  )
)

if not defined PHP_EXE (
  echo  [ERREUR] PHP n'a pas ete trouve sur votre ordinateur.
  echo.
  echo   Solution 1 (la plus simple) :
  echo     1. Installez XAMPP : https://www.apachefriends.org/fr/download.html
  echo     2. A la fin de l'installation, lancez XAMPP Control Panel
  echo     3. Cliquez sur START a cote de MySQL
  echo     4. Relancez ce fichier install.bat
  echo.
  pause
  exit /b 1
)
echo  [OK] PHP detecte : %PHP_EXE%

REM Ajouter le dossier PHP au PATH pour cette session
for %%i in ("%PHP_EXE%") do set "PHP_DIR=%%~dpi"
set "PATH=%PHP_DIR%;%PATH%"

REM ---------- Trouver Node.js ----------
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  [ERREUR] Node.js n'est pas installe.
  echo.
  echo   1. Allez sur https://nodejs.org/fr
  echo   2. Telechargez la version LTS (la grosse case verte a gauche)
  echo   3. Installez-la en cliquant sur Suivant/Next partout
  echo   4. Redemarrez votre ordinateur
  echo   5. Relancez ce fichier install.bat
  echo.
  pause
  exit /b 1
)
echo  [OK] Node.js detecte.
for /f "delims=" %%v in ('node -v') do echo       Version : %%v
echo.

REM ---------- Vérifier MySQL ----------
echo  [1/4] Verification de MySQL ...
:verify_mysql
php -r "@fsockopen('127.0.0.1',3306,$e,$es,3); exit($es?1:0);" 2>nul
if errorlevel 1 (
  echo.
  echo  [ERREUR] MySQL n'est pas demarre.
  echo.
  echo   Faites ceci :
  echo     1. Ouvrez XAMPP Control Panel (icone orange dans le menu Demarrer)
  echo     2. Cliquez sur le bouton START a cote de MySQL
  echo        (il devient vert et le bouton devient Stop)
  echo     3. Vous n'avez PAS besoin de demarrer Apache.
  echo     4. Revenez ici et appuyez sur une touche pour reessayer.
  echo.
  pause
  cls
  goto :verify_mysql
)
echo        [OK] MySQL est demarre.
echo.

echo  [2/4] Creation de la base de donnees "boutika" ...
cd backend
php scripts/install.php
if errorlevel 1 (
  cd ..
  echo.
  echo  [ERREUR] Un probleme est survenu pendant l'installation.
  echo   Recopiez le texte ci-dessus et envoyez-le.
  pause
  exit /b 1
)
cd ..
echo        [OK] Base de donnees prete avec les donnees de demo.
echo.

echo  [3/4] Test du backend PHP ...
start /B php -S 127.0.0.1:5000 -t backend/public backend/public/index.php >nul 2>nul
timeout /t 3 /nobreak >nul
php -r "@fopen('http://127.0.0.1:5000/api/health','r') or exit(1);" 2>nul
if errorlevel 1 (
  echo        [ATTENTION] Le backend a mis du temps mais ce n'est pas grave.
) else (
  echo        [OK] L'API repond correctement.
)
REM Arreter le backend temporaire
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5000 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>nul
echo.

echo  [4/4] Installation des dependances React (npm) ...
if not exist "node_modules" (
  echo        Telechargement en cours (1-2 minutes)...
  call npm install --no-audit --no-fund --loglevel=error
) else (
  echo        Dependances deja presentes.
)
if errorlevel 1 (
  echo.
  echo  [ERREUR] Echec de npm install. Verifiez votre connexion internet.
  pause
  exit /b 1
)
echo        [OK] React est pret.
echo.

echo.
echo  ========================================================
echo     INSTALLATION TERMINEE AVEC SUCCES !
echo  ========================================================
echo.
echo     Il ne vous reste plus qu'a double-cliquer sur :
echo        start.bat
echo.
echo     Le site s'ouvrira automatiquement dans votre navigateur.
echo.
pause
