<#
.SYNOPSIS
    Starts the full-stack Car Marketplace Platform (Spring Boot Backend + React/Vite Frontend).

.DESCRIPTION
    Launches the Spring Boot 3 backend on port 8080 and the Vite/React frontend on port 5173 in dedicated console windows.
    Automatically discovers and configures Java (JDK 21+) and Node.js environments if not already in PATH.
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

$WorkspaceRoot = $PSScriptRoot
$BackendDir = Join-Path $WorkspaceRoot "backend"
$FrontendDir = Join-Path $WorkspaceRoot "frontend"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      Car Marketplace Platform - Startup Orchestrator     " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# -------------------------------------------------------------
# Helper: Auto-Discover and Configure Java Runtime
# -------------------------------------------------------------
function Find-JavaRuntime {
    $foundHome = $null
    $foundJava = $null

    # 1. Existing JAVA_HOME environment variable
    if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) {
        $foundHome = $env:JAVA_HOME
        $foundJava = Join-Path $env:JAVA_HOME "bin\java.exe"
    }

    # 2. Existing java in PATH
    if (-not $foundJava) {
        $cmd = Get-Command java.exe -ErrorAction SilentlyContinue
        if ($cmd -and (Test-Path $cmd.Source)) {
            $foundJava = $cmd.Source
            $binDir = Split-Path -Parent $foundJava
            $possibleHome = Split-Path -Parent $binDir
            if (Test-Path (Join-Path $possibleHome "lib")) {
                $foundHome = $possibleHome
            }
        }
    }

    # 3. Search standard Windows installation locations
    if (-not $foundHome) {
        $searchPatterns = @(
            "C:\Program Files\Java\jdk-25",
            "C:\Program Files\Java\jdk-21*",
            "C:\Program Files\Java\jdk*",
            "C:\Program Files\Eclipse Adoptium\jdk-21*",
            "C:\Program Files\Eclipse Adoptium\jdk*",
            "C:\Program Files\Microsoft\jdk-21*",
            "C:\Program Files\Microsoft\jdk*",
            "C:\Program Files\BellSoft\LibericaJDK*",
            "C:\Program Files\Amazon Corretto\jdk*"
        )
        foreach ($pattern in $searchPatterns) {
            $matches = Resolve-Path $pattern -ErrorAction SilentlyContinue
            foreach ($match in $matches) {
                if (Test-Path (Join-Path $match.Path "bin\java.exe")) {
                    $foundHome = $match.Path
                    $foundJava = Join-Path $match.Path "bin\java.exe"
                    break
                }
            }
            if ($foundHome) { break }
        }
    }

    # Fallback to Oracle javapath if available
    if (-not $foundJava -and (Test-Path "C:\Program Files\Common Files\Oracle\Java\javapath\java.exe")) {
        $foundJava = "C:\Program Files\Common Files\Oracle\Java\javapath\java.exe"
    }

    return [PSCustomObject]@{
        JavaHome = $foundHome
        JavaExe  = $foundJava
    }
}

# -------------------------------------------------------------
# Helper: Auto-Discover and Configure Node.js Runtime
# -------------------------------------------------------------
function Find-NodeRuntime {
    $foundNode = $null
    $foundDir = $null

    $cmd = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($cmd -and (Test-Path $cmd.Source)) {
        $foundNode = $cmd.Source
        $foundDir = Split-Path -Parent $foundNode
    } else {
        $candidates = @(
            "C:\Program Files\nodejs\node.exe",
            "C:\Program Files (x86)\nodejs\node.exe"
        )
        foreach ($c in $candidates) {
            if (Test-Path $c) {
                $foundNode = $c
                $foundDir = Split-Path -Parent $c
                break
            }
        }
    }

    return [PSCustomObject]@{
        NodeExe = $foundNode
        NodeDir = $foundDir
    }
}

# [1/4] Checking prerequisites
Write-Host "[1/4] Checking prerequisites and environment..." -ForegroundColor White

$javaConfig = $null
if (-not $FrontendOnly) {
    if (-not (Test-Path (Join-Path $BackendDir "mvnw.cmd"))) {
        Write-Error "Backend maven wrapper not found at: $BackendDir\mvnw.cmd"
        exit 1
    }

    $javaConfig = Find-JavaRuntime

    if (-not $javaConfig.JavaExe) {
        Write-Host "  [ERROR] Java 21+ was not found on your system." -ForegroundColor Red
        Write-Host "  Please install JDK 21 or later from: https://adoptium.net/" -ForegroundColor Yellow
        exit 1
    }

    # Automatically set JAVA_HOME and prepend to PATH for this session
    if ($javaConfig.JavaHome) {
        $env:JAVA_HOME = $javaConfig.JavaHome
        $env:Path = "$($javaConfig.JavaHome)\bin;$env:Path"
        Write-Host "  [OK] Java Home: $($javaConfig.JavaHome)" -ForegroundColor Green
    } else {
        Write-Host "  [OK] Java executable: $($javaConfig.JavaExe)" -ForegroundColor Green
    }
}

$nodeConfig = $null
if (-not $BackendOnly) {
    $nodeConfig = Find-NodeRuntime

    if (-not $nodeConfig.NodeExe) {
        Write-Host "  [ERROR] Node.js was not found on your system." -ForegroundColor Red
        Write-Host "  Please install Node.js (v18+) from: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }

    if ($nodeConfig.NodeDir) {
        $env:Path = "$($nodeConfig.NodeDir);$env:Path"
    }

    Write-Host "  [OK] Node.js executable: $($nodeConfig.NodeExe)" -ForegroundColor Green

    # Install frontend dependencies if missing
    if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
        Write-Host "  [..] 'node_modules' missing. Running 'npm install'..." -ForegroundColor Yellow
        Push-Location $FrontendDir
        try {
            npm install
            Write-Host "  [OK] Frontend dependencies installed successfully." -ForegroundColor Green
        } catch {
            Write-Error "Failed to install frontend dependencies: $_"
            exit 1
        } finally {
            Pop-Location
        }
    }
}

# [2/4] Start Backend
if (-not $FrontendOnly) {
    Write-Host "`n[2/4] Starting Spring Boot 3 Backend on port 8080..." -ForegroundColor White

    $javaEnvInit = ""
    if ($javaConfig.JavaHome) {
        $javaEnvInit = "`$env:JAVA_HOME = '$($javaConfig.JavaHome)'; `$env:Path = '$($javaConfig.JavaHome)\bin;' + `$env:Path;"
    }

    $backendScript = @"
`$host.UI.RawUI.WindowTitle = 'Car Marketplace - Spring Boot Backend (Port 8080)'
$javaEnvInit
Set-Location '$BackendDir'
Write-Host '========================================================' -ForegroundColor Cyan
Write-Host '  Starting Spring Boot 3 Backend (Port 8080)            ' -ForegroundColor Yellow
Write-Host '  Press Ctrl+C to stop the backend                      ' -ForegroundColor Gray
Write-Host '========================================================' -ForegroundColor Cyan
.\mvnw.cmd spring-boot:run
"@

    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $backendScript
    Write-Host "  -> Backend process started in dedicated console window." -ForegroundColor Gray
}

# [3/4] Start Frontend
if (-not $BackendOnly) {
    Write-Host "`n[3/4] Starting Vite + React Frontend on port 5173..." -ForegroundColor White

    $nodeEnvInit = ""
    if ($nodeConfig.NodeDir) {
        $nodeEnvInit = "`$env:Path = '$($nodeConfig.NodeDir);' + `$env:Path;"
    }

    $frontendScript = @"
`$host.UI.RawUI.WindowTitle = 'Car Marketplace - Vite Frontend (Port 5173)'
$nodeEnvInit
Set-Location '$FrontendDir'
Write-Host '========================================================' -ForegroundColor Cyan
Write-Host '  Starting Vite Dev Server (Port 5173)                  ' -ForegroundColor Yellow
Write-Host '  Press Ctrl+C to stop the frontend                     ' -ForegroundColor Gray
Write-Host '========================================================' -ForegroundColor Cyan
npm run dev
"@

    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $frontendScript
    Write-Host "  -> Frontend process started in dedicated console window." -ForegroundColor Gray
}

# [4/4] Readiness Check
Write-Host "`n[4/4] Verifying services readiness..." -ForegroundColor White

$frontendUrl = "http://localhost:5173"
$backendApiUrl = "http://localhost:8080/api/v1/cars"
$h2ConsoleUrl = "http://localhost:8080/h2-console"

if (-not $FrontendOnly) {
    Write-Host "  Waiting for backend API ($backendApiUrl) to be ready..." -NoNewline -ForegroundColor Gray
    $maxAttempts = 45
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
        Write-Host " Timeout waiting for backend. Check the backend window for startup logs." -ForegroundColor Yellow
    }
}

if (-not $BackendOnly) {
    Write-Host "  Waiting for frontend ($frontendUrl) to be ready..." -NoNewline -ForegroundColor Gray
    $maxAttempts = 25
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
        Write-Host " Timeout waiting for frontend. Check the frontend window for logs." -ForegroundColor Yellow
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
