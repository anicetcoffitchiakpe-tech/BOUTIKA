@echo off
REM ============================================================
REM  BOUTIKA - DEMARRAGE EN UN CLIC
REM  Double-cliquez sur CE FICHIER pour lancer tout le projet.
REM ============================================================
setlocal EnableDelayedExpansion
cd /d "%~dp0"

chcp 65001 >nul
title Boutika - Serveur en cours...

echo.
echo  ========================================================
echo       B O U T I K A   -   D E M A R R A G E
echo  ========================================================
echo.

REM ---------- Si node_modules absent, proposer de lancer install ----------
if not exist "node_modules" (
  echo  [ERREUR] Le projet n'est pas encore installe.
  echo.
  echo  Double-cliquez d'abord sur install.bat (une seule fois),
  echo  puis revenez sur start.bat.
  echo.
  pause
  exit /b 1
)

REM ---------- Trouver PHP automatiquement ----------
set "PHP_EXE="
for %%d in (
  "C:\xampp\php"
  "D:\xampp\php"
  "E:\xampp\php"
) do (
  if exist "%%~d\php.exe" if not defined PHP_EXE set "PHP_EXE=%%~d\php.exe"
)
if not defined PHP_EXE if exist "C:\wamp64\bin\php" (
  for /f "delims=" %%d in ('dir /b /ad /o-n "C:\wamp64\bin\php" 2^>nul') do (
    if exist "C:\wamp64\bin\php\%%d\php.exe" if not defined PHP_EXE set "PHP_EXE=C:\wamp64\bin\php\%%d\php.exe"
  )
)
if not defined PHP_EXE (
  echo  [ERREUR] PHP introuvable. Lancez d'abord install.bat.
  pause
  exit /b 1
)
for %%i in ("%PHP_EXE%") do set "PHP_DIR=%%~dpi"
set "PATH=%PHP_DIR%;%PATH%"
echo  [OK] PHP charge.

where node >nul 2>nul
if errorlevel 1 (
  echo  [ERREUR] Node.js introuvable.
  pause
  exit /b 1
)
echo  [OK] Node.js charge.
echo.

REM ---------- Arreter ce qui ecoute deja sur 5000 et 5173 ----------
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5000 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>nul

REM ---------- Demarrer le backend dans une fenetre dediee ----------
echo  [1/3] Demarrage de l'API (port 5000) ...
start "Boutika BACKEND (PHP - port 5000)" cmd /k "cd /d "%~dp0backend" && "%PHP_EXE%" -S 0.0.0.0:5000 -t public public/index.php"

REM ---------- Attendre que l'API reponde ----------
echo  [2/3] Attente de l'API ...
set /a tries=0
:wait_api
timeout /t 1 /nobreak >nul
php -r "@fopen('http://127.0.0.1:5000/api/health','r') or exit(1);" >nul 2>nul
if not errorlevel 1 goto api_ok
set /a tries+=1
if !tries! lss 20 goto wait_api
echo        [ATTENTION] L'API met du temps, on continue quand meme...
goto start_front
:api_ok
echo        [OK] API prete sur http://localhost:5000
echo.

REM ---------- Demarrer le frontend dans une fenetre dediee ----------
:start_front
echo  [3/3] Demarrage du site React (port 5173) ...
start "Boutika FRONTEND (React - port 5173)" cmd /k "cd /d "%~dp0" && npm run dev"

echo        Attente du site (6 secondes) ...
timeout /t 6 /nobreak >nul

echo.
echo  ========================================================
echo       BOUTIKA EST EN LIGNE !
echo  ========================================================
echo.
echo    Boutique publique    http://localhost:5173
echo    Espace administration  http://localhost:5173/admin
echo    Verification API     http://localhost:5000/api/health
echo.
echo    Identifiants de demonstration :
echo      Administrateur : admin@boutika.bj  /  boutika2026
echo      Gestionnaire   : gestion@boutika.bj / boutika2026
echo.
echo    DEUX FENETRES SONT OUVERTES :
echo      - Boutika BACKEND    (ne pas fermer)
echo      - Boutika FRONTEND   (ne pas fermer)
echo.
echo    Pour arreter : fermez ces deux fenetres.
echo  ========================================================
echo.

REM ---------- Ouvrir le navigateur automatiquement ----------
echo  Ouverture du navigateur ...
start "" "http://localhost:5173"

echo.
echo  Vous pouvez fermer cette fenetre (les deux autres restent ouvertes).
echo.
pause
