#Requires -Version 5.1
<#
  Start GTKBlog dev server + expose via ngrok
#>
$ErrorActionPreference = 'Stop'

# 1. Start Docker Desktop if not running
$dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerProcess) {
    Write-Host "[1/5] Docker Desktop chua chay. Dang khoi dong..." -ForegroundColor Yellow
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process -FilePath $dockerPath
    } else {
        Write-Error "Khong tim thay Docker Desktop.exe. Vui long cai Docker Desktop hoac khoi dong PostgreSQL thu cong."
        exit 1
    }
} else {
    Write-Host "[1/5] Docker Desktop da chay." -ForegroundColor Green
}

# 2. Wait for Docker engine
Write-Host "[2/5] Doi Docker engine san sang..." -ForegroundColor Cyan
$maxWait = 90
$elapsed = 0
while ($elapsed -lt $maxWait) {
    try {
        $null = docker ps 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[2/5] Docker engine san sang." -ForegroundColor Green
            break
        }
    } catch {}
    Start-Sleep -Seconds 2
    $elapsed += 2
    Write-Host "    Da doi ${elapsed}s..." -ForegroundColor DarkGray
}
if ($elapsed -ge $maxWait) {
    Write-Error "Docker engine khong san sang sau ${maxWait}s. Vui long kiem tra Docker Desktop."
    exit 1
}

# 3. Ensure Postgres container running (match .env.local credentials)
$containerName = "gtkblog-postgres"
$running = docker ps --format "{{.Names}}" | Select-String -Pattern "^$containerName$"
if (-not $running) {
    Write-Host "[3/5] Khoi dong container PostgreSQL..." -ForegroundColor Cyan
    # Remove old container if exists but stopped
    $exists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "^$containerName$"
    if ($exists) {
        docker rm -f $containerName | Out-Null
    }
    docker run -d `
        --name $containerName `
        -e POSTGRES_USER=thinknote `
        -e POSTGRES_PASSWORD=thinknote_dev `
        -e POSTGRES_DB=gtkblog `
        -p 5432:5432 `
        -v gtkblog_pgdata:/var/lib/postgresql/data `
        --restart unless-stopped `
        postgres:17-alpine | Out-Null

    # Wait for Postgres to accept connections
    Write-Host "[3/5] Doi PostgreSQL san sang..." -ForegroundColor Cyan
    $pgWait = 0
    while ($pgWait -lt 30) {
        Start-Sleep -Seconds 2
        $pgWait += 2
        try {
            $test = docker exec $containerName pg_isready -U thinknote 2>$null
            if ($test -match "accepting connections") {
                Write-Host "[3/5] PostgreSQL san sang." -ForegroundColor Green
                break
            }
        } catch {}
    }
} else {
    Write-Host "[3/5] Container PostgreSQL da chay." -ForegroundColor Green
}

# 4. Install ngrok if not available
$ngrokCmd = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokCmd) {
    Write-Host "[4/5] Cai dat ngrok..." -ForegroundColor Cyan
    npm install -g ngrok | Out-Null
    $ngrokCmd = Get-Command ngrok -ErrorAction SilentlyContinue
    if (-not $ngrokCmd) {
        Write-Error "Cai dat ngrok that bai. Vui long kiem tra ket noi mang."
        exit 1
    }
} else {
    Write-Host "[4/5] ngrok da duoc cai dat." -ForegroundColor Green
}

# 5. Start dev server in new window, then ngrok in another window
Write-Host "[5/5] Khoi dong dev server va ngrok..." -ForegroundColor Cyan

# Dev server window
$devTitle = "GTKBlog Dev Server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
    `$Host.UI.RawUI.WindowTitle = '$devTitle'
    Write-Host '>>> Dang khoi dong Next.js dev server...' -ForegroundColor Green
    Set-Location '$PSScriptRoot\..'
    npm run dev
"

# Wait a bit for server to start
Start-Sleep -Seconds 5

# Ngrok window
$ngrokTitle = "GTKBlog Ngrok"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
    `$Host.UI.RawUI.WindowTitle = '$ngrokTitle'
    Write-Host '>>> Dang khoi dong ngrok tunnel toi localhost:3000...' -ForegroundColor Green
    ngrok http 3000
"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Dev server va ngrok dang khoi dong!  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Cua so PowerShell moi se hien thi:"
Write-Host "  1. Next.js dev server (port 3000)"
Write-Host "  2. Ngrok tunnel (public URL)"
Write-Host ""
Write-Host "De xem public URL, nhin vao cua so Ngrok hoac mo: http://localhost:4040" -ForegroundColor Yellow
