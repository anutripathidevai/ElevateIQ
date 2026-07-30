<#
.SYNOPSIS
    Validate that ElevateIQ is connected to the database in production.

.DESCRIPTION
    1) Polls <AppUrl>/api/health until it reports { "db": true } (App Service
       restarts take a little time).
    2) If -DatabaseUrl is provided, prints row counts for key tables so you can
       confirm the schema was applied and the problem bank was seeded.

.EXAMPLE
    ./scripts/azure/validate-db.ps1 -AppUrl https://elevateiq-web.azurewebsites.net

.EXAMPLE
    ./scripts/azure/validate-db.ps1 -AppUrl https://elevateiq-web.azurewebsites.net -DatabaseUrl $env:DATABASE_URL
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $AppUrl,
    [string] $DatabaseUrl = $env:DATABASE_URL,
    [int]    $Retries     = 12,
    [int]    $DelaySeconds = 10
)

$ErrorActionPreference = 'Stop'
$AppUrl = $AppUrl.TrimEnd('/')

Write-Host "==> Checking $AppUrl/api/health ..." -ForegroundColor Green
$ok = $false
for ($i = 1; $i -le $Retries; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "$AppUrl/api/health" -TimeoutSec 15
        $dbFlag = [bool]$resp.db
        Write-Host ("  attempt {0}/{1}: status={2} db={3} ai={4}" -f $i, $Retries, $resp.status, $resp.db, $resp.ai)
        if ($dbFlag) { $ok = $true; break }
    }
    catch {
        Write-Host ("  attempt {0}/{1}: not reachable yet ({2})" -f $i, $Retries, $_.Exception.Message) -ForegroundColor DarkYellow
    }
    if ($i -lt $Retries) { Start-Sleep -Seconds $DelaySeconds }
}

if ($ok) {
    Write-Host "HEALTH: db=true  ✔  The app is using the database." -ForegroundColor Green
}
else {
    Write-Host "HEALTH: db is still false after $Retries attempts." -ForegroundColor Red
    Write-Host "  - Confirm DATABASE_URL is set on the App Service (and the app restarted)." -ForegroundColor Yellow
    Write-Host "  - Confirm the Postgres firewall allows Azure services." -ForegroundColor Yellow
    Write-Host "  - Check App Service > Log stream for connection errors." -ForegroundColor Yellow
}

if ($DatabaseUrl) {
    Write-Host ""
    Write-Host "==> Row counts (direct DB check)..." -ForegroundColor Green
    $env:DATABASE_URL = $DatabaseUrl
    node (Join-Path $PSScriptRoot 'db-counts.mjs')
    Write-Host "(Expect Problem > 0 after seeding; other tables start at 0.)" -ForegroundColor DarkGray
}

Write-Host ""
if ($ok) { exit 0 } else { exit 1 }
