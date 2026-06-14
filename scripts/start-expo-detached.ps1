$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$preferredPort = if ($env:EXPO_PORT) { [int]$env:EXPO_PORT } else { 8081 }

$pathValue = [Environment]::GetEnvironmentVariable('Path', 'Process')
if (-not $pathValue) {
    $pathValue = [Environment]::GetEnvironmentVariable('PATH', 'Process')
}

[Environment]::SetEnvironmentVariable('PATH', $null, 'Process')
[Environment]::SetEnvironmentVariable('Path', $pathValue, 'Process')

function Test-PortAvailable {
    param([int]$Port)

    $listener = $null
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse('127.0.0.1'), $Port)
        $listener.Start()
        return $true
    }
    catch {
        return $false
    }
    finally {
        if ($listener) {
            $listener.Stop()
        }
    }
}

function Test-PackagerRunning {
    param([int]$Port)

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:$Port/status" -TimeoutSec 2
        $content = if ($response.Content -is [byte[]]) {
            [System.Text.Encoding]::UTF8.GetString($response.Content)
        }
        else {
            [string]$response.Content
        }

        return $content.Contains('packager-status:running')
    }
    catch {
        return $false
    }
}

function Test-CurrentProjectRunning {
    param([int]$Port)

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:$Port" -TimeoutSec 2
        $content = if ($response.Content -is [byte[]]) {
            [System.Text.Encoding]::UTF8.GetString($response.Content)
        }
        else {
            [string]$response.Content
        }

        return $content.Contains('<title>Week 10 Maps</title>')
    }
    catch {
        return $false
    }
}

for ($candidate = $preferredPort; $candidate -lt ($preferredPort + 20); $candidate++) {
    if (Test-CurrentProjectRunning -Port $candidate) {
        Write-Output "Expo is already running this project on port $candidate"
        Write-Output "URL: http://localhost:$candidate"
        exit 0
    }
}

$port = $null
for ($candidate = $preferredPort; $candidate -lt ($preferredPort + 20); $candidate++) {
    if (Test-PortAvailable -Port $candidate) {
        $port = $candidate
        break
    }
}

if (-not $port) {
    throw "No available Expo port found from $preferredPort to $($preferredPort + 19)."
}

$log = Join-Path $projectRoot "expo-$port.log"
$err = Join-Path $projectRoot "expo-$port.err.log"
$pidFile = Join-Path $projectRoot "expo-$port.pid"

Set-Content -LiteralPath $log -Value "Expo detached launcher started Metro on port $port."
Set-Content -LiteralPath $err -Value ''

$process = Start-Process `
    -FilePath 'C:\Program Files\nodejs\npx.cmd' `
    -ArgumentList @('expo', 'start', '--offline', '--port', "$port", '--max-workers', '0') `
    -WorkingDirectory $projectRoot `
    -WindowStyle Hidden `
    -PassThru

Set-Content -LiteralPath $pidFile -Value $process.Id

Write-Output "Expo started on port $port with PID $($process.Id)"
Write-Output "URL: http://localhost:$port"
