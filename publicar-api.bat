@echo off
chcp 65001 >nul
title Publicar site no GitHub Pages (sem Git)
cd /d "%~dp0"

echo ============================================
echo   PUBLICAR O SITE - VIA API DO GITHUB
echo   Pasta: %CD%
echo ============================================
echo.

if not exist "%USERPROFILE%\.github-token" (
  if "%GITHUB_TOKEN%"=="" (
    echo [ATENCAO] Token nao encontrado.
    echo.
    echo 1. Crie um token em https://github.com/settings/tokens
    echo    (Fine-grained - Contents: Read and write - so no repositorio
    echo     wsmelo-dev/wesleymeloPJ.com)
    echo 2. Salve o token em  %USERPROFILE%\.github-token
    echo.
    pause
    exit /b 1
  )
)

set /p "msg=Descreva a mudanca (ou aperte Enter): "
if "%msg%"=="" set "msg=Atualiza o site"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0publicar.ps1" -Message "%msg%"
echo.
pause
