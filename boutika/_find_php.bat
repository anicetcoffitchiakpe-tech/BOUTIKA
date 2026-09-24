@echo off
REM ============================================================
REM  Petit helper : cherche php.exe dans les emplacements XAMPP/WAMP/Laragon
REM  courants et l'ajoute au PATH pour la durée du script appelant.
REM  A appeler au DEBUT de chaque .bat : call _find_php.bat
REM ============================================================

where php >nul 2>nul
if not errorlevel 1 goto :eof

REM Liste des chemins possibles pour PHP
set "PATHS_TO_CHECK=C:\xampp\php;D:\xampp\php;E:\xampp\php;C:\wamp64\bin\php;C:\laragon\bin\php"

for %%d in (C:\xampp\php D:\xampp\php E:\xampp\php) do (
    if exist "%%d\php.exe" (
        set "PATH=%%d;%PATH%"
        goto :found
    )
)

REM Cherche la derniere version de PHP dans WAMP
if exist "C:\wamp64\bin\php" (
    for /f "delims=" %%d in ('dir /b /ad /o-n "C:\wamp64\bin\php" 2^>nul') do (
        if exist "C:\wamp64\bin\php\%%d\php.exe" (
            set "PATH=C:\wamp64\bin\php\%%d;%PATH%"
            goto :found
        )
    )
)

REM Cherche dans Laragon
if exist "C:\laragon\bin\php" (
    for /f "delims=" %%d in ('dir /b /ad /o-n "C:\laragon\bin\php" 2^>nul') do (
        if exist "C:\laragon\bin\php\%%d\php.exe" (
            set "PATH=C:\laragon\bin\php\%%d;%PATH%"
            goto :found
        )
    )
)

REM Si pas trouve, on affiche une erreur claire
echo.
echo  [ERREUR] PHP n'a pas ete trouve sur votre ordinateur.
echo.
echo   Solutions :
echo   1. Ouvrez XAMPP Control Panel, cliquez sur le bouton SHELL en haut a droite,
echo      puis tapez : cd CHEMIN_VERS_VOTRE_DOSSIER_BOUTIKA  (ex: cd Download\boutika)
echo      puis lancez install.bat / start.bat depuis cette fenetre.
echo.
echo   2. Si vous n'avez pas installe XAMPP, telechargez-le sur :
echo        https://www.apachefriends.org/fr/index.html
echo      Puis demarrez MySQL depuis le panneau XAMPP.
echo.
pause
exit /b 1

:found
echo        [OK] PHP detecte automatiquement.
goto :eof
