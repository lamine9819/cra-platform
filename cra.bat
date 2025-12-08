@echo off
REM CLI wrapper pour Windows
REM Appelle le script bash via Git Bash

REM Vérifie si Git Bash est installé
where bash >nul 2>nul
if %errorlevel% neq 0 (
    echo Erreur: Git Bash n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Git pour Windows: https://git-scm.com/download/win
    exit /b 1
)

REM Exécute le script bash
bash "%~dp0cra" %*
