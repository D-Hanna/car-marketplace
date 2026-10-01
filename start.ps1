<#
.SYNOPSIS
    Starts the full-stack Car Marketplace Platform (Spring Boot Backend + React/Vite Frontend).

.DESCRIPTION
    Launches the Spring Boot 3 backend on port 8080 and the Vite/React frontend on port 5173 in dedicated console windows.
    Performs readiness health-checks and opens the web application in your default browser.

.PARAMETER BackendOnly
    Starts only the Spring Boot 3 backend.

.PARAMETER FrontendOnly
    Starts only the React/Vite frontend.

.PARAMETER NoBrowser
    Prevents automatic opening of the web browser once the application is ready.

.EXAMPLE
    .\start.ps1
    Starts both backend and frontend, waits for readiness, and opens http://localhost:5173.

.EXAMPLE
    .\start.ps1 -BackendOnly
#>

[CmdletBinding()]
param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$WorkspaceRoot = $PSScriptRoot
$BackendDir = Join-Path $WorkspaceRoot "backend"
$FrontendDir = Join-Path $WorkspaceRoot "frontend"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      Car Marketplace Platform - Startup Orchestrator     " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Verify prerequisites
Write-Host "[1/4] Checking prerequisites..." -ForegroundColor White

if (-not $FrontendOnly) {
    if (-not (Test-Path (Join-Path $BackendDir "mvnw.cmd"))) {
        Write-Error "Backend maven wrapper not found at $BackendDir\mvnw.cmd"
        exit 1
    }
    try {
        $javaVersion = java -version 2>&1 | Out-String
        Write-Host "  [OK] Java Runtime detected." -ForegroundColor Green
    } catch {
        Write-Error "Java 21+ is required but 'java' was not found in PATH."
        exit 1
    }
}

if (-not $BackendOnly) {
    try {
        $nodeVersion = node -v 2>&1
        Write-Host "  [OK] Node.js runtime detected ($nodeVersion)." -ForegroundColor Green
    } catch {
        Write-Error "Node.js is required but 'node' was not found in PATH."
        exit 1
    }

    if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
        Write-Host "  [..] 'node_modules' missing. Running 'npm install'..." -ForegroundColor Yellow
        Push-Location $FrontendDir
        try {
            npm install
            Write-Host "  [OK] Frontend dependencies installed." -ForegroundColor Green
        } finally {
            Pop-Location
        }
    }
}

# Start Backend
if (-not $FrontendOnly) {
    Write-Host "`n[2/4] Starting Spring Boot 3 Backend on port 8080..." -ForegroundColor White
    $backendCmd = @"
`$host.UI.RawUI.WindowTitle = 'Car Marketplace - Spring Boot Backend (Port 8080)'
Set-Location '$BackendDir'
Write-Host 'Starting Spring Boot backend (Ctrl+C to stop)...' -ForegroundColor Cyan
.\mvnw.cmd spring-boot:run
"@
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $backendCmd
    Write-Host "  -> Backend launched in dedicated console window." -ForegroundColor Gray
}

# Start Frontend
if (-not $BackendOnly) {
    Write-Host "`n[3/4] Starting Vite + React Frontend on port 5173..." -ForegroundColor White
    $frontendCmd = @"
`$host.UI.RawUI.WindowTitle = 'Car Marketplace - Vite Frontend (Port 5173)'
Set-Location '$FrontendDir'
Write-Host 'Starting Vite React dev server (Ctrl+C to stop)...' -ForegroundColor Cyan
npm run dev
"@
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $frontendCmd
    Write-Host "  -> Frontend launched in dedicated console window." -ForegroundColor Gray
}

# Health Check & Readiness Wait
Write-Host "`n[4/4] Verifying services readiness..." -ForegroundColor White

$frontendUrl = "http://localhost:5173"
$backendApiUrl = "http://localhost:8080/api/v1/cars"
$h2ConsoleUrl = "http://localhost:8080/h2-console"

if (-not $FrontendOnly) {
    Write-Host "  Waiting for backend API ($backendApiUrl) to be ready..." -NoNewline -ForegroundColor Gray
    $maxAttempts = 40
    $attempt = 0
    $backendReady = $false

    while (-not $backendReady -and $attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 1
        $attempt++
        try {
            $resp = Invoke-RestMethod -Uri $backendApiUrl -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($null -ne $resp) {
                $backendReady = $true
            }
        } catch {
            Write-Host "." -NoNewline -ForegroundColor DarkGray
        }
    }

    if ($backendReady) {
        Write-Host " Ready!" -ForegroundColor Green
    } else {
        Write-Host " Timeout waiting for backend. Please check the backend window for logs." -ForegroundColor Yellow
    }
}

if (-not $BackendOnly) {
    Write-Host "  Waiting for frontend ($frontendUrl) to be ready..." -NoNewline -ForegroundColor Gray
    $maxAttempts = 20
    $attempt = 0
    $frontendReady = $false

    while (-not $frontendReady -and $attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 1
        $attempt++
        try {
            $resp = Invoke-WebRequest -Uri $frontendUrl -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($resp.StatusCode -eq 200) {
                $frontendReady = $true
            }
        } catch {
            Write-Host "." -NoNewline -ForegroundColor DarkGray
        }
    }

    if ($frontendReady) {
        Write-Host " Ready!" -ForegroundColor Green
    } else {
        Write-Host " Timeout waiting for frontend. Please check the frontend window for logs." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "            Platform Successfully Launched!               " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  * Frontend Application: " -NoNewline; Write-Host $frontendUrl -ForegroundColor Cyan
Write-Host "  * Backend REST API:     " -NoNewline; Write-Host $backendApiUrl -ForegroundColor Cyan
Write-Host "  * H2 In-Memory DB:      " -NoNewline; Write-Host $h2ConsoleUrl -ForegroundColor Cyan
Write-Host "      JDBC URL:           jdbc:h2:mem:cardb" -ForegroundColor Gray
Write-Host "      Username:           sa (Password: empty)" -ForegroundColor Gray
Write-Host "  * API Specification:    " -NoNewline; Write-Host "specs/car-marketplace-api.yaml" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""

if (-not $NoBrowser -and -not $BackendOnly) {
    Write-Host "Opening $frontendUrl in default browser..." -ForegroundColor Yellow
    Start-Process $frontendUrl
}

Write-Host "Press Ctrl+C inside the respective console windows whenever you wish to stop a service." -ForegroundColor Gray
