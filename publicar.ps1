<#
  publicar.ps1 · Publica o site no GitHub Pages sem precisar de Git instalado.
  Usa a API do GitHub (Contents API) para enviar os arquivos da pasta para o
  repositório wsmelo-dev/wesleymeloPJ.com, branch main.

  Como usar:
    1. Crie um token em https://github.com/settings/tokens (Fine-grained,
       permissões: Contents -> Read and write, apenas no repositório
       wsmelo-dev/wesleymeloPJ.com).
    2. Salve o token em um arquivo:  %USERPROFILE%\.github-token
       (ou defina a variavel de ambiente GITHUB_TOKEN)
    3. Rode:  powershell -ExecutionPolicy Bypass -File publicar.ps1
       (ou clique duas vezes em publicar-api.bat)

  O site no ar atualiza em ate 1 minuto.
#>

[CmdletBinding()]
param(
  [string]$Message = "Atualiza o site",
  [string]$Branch  = "main"
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Repo    = "wsmelo-dev/wesleymeloPJ.com"
$ApiBase = "https://api.github.com/repos/$Repo"

# ---------- credencial ----------
function Get-Token {
  $t = $env:GITHUB_TOKEN
  if (-not $t) {
    $f = Join-Path $env:USERPROFILE ".github-token"
    if (Test-Path $f) { $t = (Get-Content $f -Raw).Trim() }
  }
  if (-not $t) {
    Write-Host ""
    Write-Host "Token nao encontrado." -ForegroundColor Yellow
    Write-Host "Salve o token em %USERPROFILE%\.github-token ou defina GITHUB_TOKEN." -ForegroundColor Yellow
    Write-Host "https://github.com/settings/tokens" -ForegroundColor DarkGray
    exit 1
  }
  return $t
}

$token = Get-Token
$headers = @{
  "Authorization" = "Bearer $token"
  "User-Agent"    = "publicar-ps1"
  "Accept"        = "application/vnd.github+json"
  "X-GitHub-Api-Version" = "2022-11-28"
}

# ---------- arquivos a publicar ----------
$publish = @(
  "index.html",
  "certificados.html",
  "DESIGN.md",
  "PRODUCT.md",
  "publicar.bat",
  "publicar.ps1",
  "publicar-api.bat"
)

# ---------- arquivos a remover do repositorio ----------
$remove = @(
  "foto.jpg",
  "style.css",
  "script.js"
)

function Get-RemoteSha([string]$path) {
  try {
    $r = Invoke-RestMethod -Uri "$ApiBase/contents/$path" -Headers $headers -Method Get
    return $r.sha
  } catch {
    return $null
  }
}

$changed = 0
$skipped = 0

Write-Host ""
Write-Host "PUBLICANDO $Repo ($Branch)" -ForegroundColor Cyan
Write-Host "----------------------------------------"

foreach ($f in $publish) {
  $local = Join-Path $PSScriptRoot $f
  if (-not (Test-Path $local)) { Write-Host "  [local ausente] $f" -ForegroundColor DarkGray; continue }

  $bytes  = [IO.File]::ReadAllBytes($local)
  $sha    = Get-RemoteSha $f
  $remote = $null
  if ($sha) {
    try {
      $r = Invoke-RestMethod -Uri "$ApiBase/contents/$f" -Headers $headers -Method Get
      $remote = $r.content -replace "\s", ""
    } catch {}
  }
  $localB64 = [Convert]::ToBase64String($bytes)
  if ($remote -and $remote -eq $localB64) {
    Write-Host "  [ok, sem mudanca] $f" -ForegroundColor DarkGray
    $skipped++
    continue
  }

  $body = @{ message = "$Message : $f"; content = $localB64; branch = $Branch }
  if ($sha) { $body.sha = $sha }
  try {
    Invoke-RestMethod -Uri "$ApiBase/contents/$f" -Headers $headers -Method Put -Body ($body | ConvertTo-Json -Depth 5) | Out-Null
    Write-Host "  [enviado] $f" -ForegroundColor Green
    $changed++
  } catch {
    Write-Host "  [ERRO] $f :: $($_.Exception.Message)" -ForegroundColor Red
  }
}

foreach ($f in $remove) {
  $sha = Get-RemoteSha $f
  if (-not $sha) { Write-Host "  [nao existe no repo] $f" -ForegroundColor DarkGray; continue }
  $body = @{ message = "$Message : remove $f"; sha = $sha; branch = $Branch }
  try {
    Invoke-RestMethod -Uri "$ApiBase/contents/$f" -Headers $headers -Method Delete -Body ($body | ConvertTo-Json -Depth 5) | Out-Null
    Write-Host "  [removido] $f" -ForegroundColor Yellow
    $changed++
  } catch {
    Write-Host "  [ERRO ao remover] $f :: $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "----------------------------------------"
Write-Host "Enviados: $changed | sem mudanca: $skipped"
Write-Host "Site: https://wsmelo-dev.github.io/wesleymeloPJ.com/  (atualiza em ate 1 minuto)" -ForegroundColor Cyan
Write-Host ""
