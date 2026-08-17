param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('watercolor', 'dashboard')]
    [string]$design
)

$rootDir = $PSScriptRoot
$srcAppDir = Join-Path $rootDir "src/app"
$backupsDir = Join-Path $rootDir "backups"

if ($design -eq "watercolor") {
    $sourceDir = Join-Path $backupsDir "watercolor"
    Write-Host "Switching to Animated Watercolor Paint Theme..." -ForegroundColor Cyan
} else {
    $sourceDir = Join-Path $backupsDir "dark-dashboard"
    Write-Host "Switching to Clean Dark Dashboard Theme..." -ForegroundColor Magenta
}

# Check if source directory exists
if (-not (Test-Path $sourceDir)) {
    Write-Error "Backup source folder not found at: $sourceDir"
    exit 1
}

# Copy files
Copy-Item -Path (Join-Path $sourceDir "page.tsx") -Destination (Join-Path $srcAppDir "page.tsx") -Force
Copy-Item -Path (Join-Path $sourceDir "layout.tsx") -Destination (Join-Path $srcAppDir "layout.tsx") -Force
Copy-Item -Path (Join-Path $sourceDir "globals.css") -Destination (Join-Path $srcAppDir "globals.css") -Force

Write-Host "Success! Files copied to src/app/. Restarting dev server will apply changes." -ForegroundColor Green
