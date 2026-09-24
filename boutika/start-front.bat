@echo off
REM ============================================================
REM  Boutika FRONTEND - Demarre React (Vite) sur le port 5173
REM
REM  IMPORTANT : Le backend (start-server.bat) doit etre lance
REM  dans une autre fenetre AVANT de lancer le front.
REM ============================================================
setlocal
cd /d "%~dp0"

if not exist "node_modules" (
    echo [boutika-frontend] Dependances absentes. Lancez d'abord install.bat.
    pause
    exit /b 1
)

echo [boutika-frontend] Demarrage du front React/Vite ...
echo [boutika-frontend]   - Boutique publique : http://localhost:5173
echo [boutika-frontend]   - Espace admin      : http://localhost:5173/admin
echo [boutika-frontend]   - Les appels /api sont proxifies vers http://localhost:5000
echo.
echo [boutika-frontend] Appuyez sur Ctrl+C pour arreter.
echo.

call npm run dev
