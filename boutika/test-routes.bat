@echo off
REM ============================================================
REM  BOUTIKA - TEST DES 41 ROUTES (preuve soutenance)
REM  IMPORTANT : le projet doit etre demarre (start.bat) avant.
REM ============================================================
setlocal
cd /d "%~dp0"
chcp 65001 >nul
title Boutika - Test des routes

echo.
echo  ========================================================
echo     TEST DES 41 ROUTES DE L'API
echo  ========================================================
echo.

REM Trouver PHP
set "PHP_EXE="
for %%d in ("C:\xampp\php" "D:\xampp\php" "E:\xampp\php") do (
  if exist "%%~d\php.exe" if not defined PHP_EXE set "PHP_EXE=%%~d\php.exe"
)
if not defined PHP_EXE if exist "C:\wamp64\bin\php" (
  for /f "delims=" %%d in ('dir /b /ad /o-n "C:\wamp64\bin\php" 2^>nul') do (
    if exist "C:\wamp64\bin\php\%%d\php.exe" if not defined PHP_EXE set "PHP_EXE=C:\wamp64\bin\php\%%d\php.exe"
  )
)
if not defined PHP_EXE (
  echo  [ERREUR] PHP introuvable.
  pause
  exit /b 1
)
for %%i in ("%PHP_EXE%") do set "PHP_DIR=%%~dpi"
set "PATH=%PHP_DIR%;%PATH%"

echo  Verification que l'API repond sur le port 5000 ...
php -r "@fopen('http://127.0.0.1:5000/api/health','r') or exit(1);" 2>nul
if errorlevel 1 (
  echo.
  echo  [ERREUR] L'API ne repond pas.
  echo  Double-cliquez sur start.bat pour demarrer le projet,
  echo  attendez que le site s'ouvre, puis revenez lancer ce test.
  echo.
  pause
  exit /b 1
)
echo  [OK] API detectee. Lancement des 41 tests ...
echo.
cd backend
php tests/run-api-tests.php
echo.
echo.
echo  Vous pouvez montrer ce resultat au jury.
pause
