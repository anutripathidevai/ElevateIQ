<#
.SYNOPSIS
    Apply Prisma migrations and seed the ElevateIQ database.

.DESCRIPTION
    Runs `prisma migrate deploy` (applies 0_init + phase2 migrations) then
    `npm run db:seed` (loads content/*.json into the Problem table, idempotent
    upsert by slug). Run once after provisioning, and re-run the seed whenever
    content/*.json changes.

    Reads DATABASE_URL from the environment, or accepts -DatabaseUrl.

.PREREQUISITES
    - Node deps installed:  npm install   (dev deps needed for the tsx seed)
    - The DB firewall must allow this machine's IP (provision script adds it).

.EXAMPLE
    $env:DATABASE_URL = 'postgresql://...sslmode=require'
    ./scripts/azure/migrate-and-seed.ps1

.EXAMPLE
    ./scripts/azure/migrate-and-seed.ps1 -DatabaseUrl 'postgresql://...sslmode=require' -SkipSeed
#>
[CmdletBinding()]
param(
    [string] $DatabaseUrl = $env:DATABASE_URL,
    [switch] $SkipSeed
)

$ErrorActionPreference = 'Stop'

if (-not $DatabaseUrl) {
    throw "DATABASE_URL not provided. Set `$env:DATABASE_URL or pass -DatabaseUrl."
}

# Move to the repo root (this script lives in scripts/azure/).
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Push-Location $repoRoot
try {
    $env:DATABASE_URL = $DatabaseUrl
    $masked = $DatabaseUrl -replace '://([^:]+):[^@]+@', '://$1:****@'
    Write-Host "Repo:         $repoRoot"
    Write-Host "DATABASE_URL: $masked" -ForegroundColor Cyan

    if (-not (Test-Path (Join-Path $repoRoot 'node_modules'))) {
        Write-Host "==> node_modules missing; running npm install..." -ForegroundColor Green
        npm install
        if ($LASTEXITCODE -ne 0) { throw "npm install failed." }
    }

    Write-Host "==> prisma migrate deploy (applies 0_init + phase2)..." -ForegroundColor Green
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) { throw "prisma migrate deploy failed." }

    if (-not $SkipSeed) {
        Write-Host "==> npm run db:seed (content/*.json -> Problem)..." -ForegroundColor Green
        npm run db:seed
        if ($LASTEXITCODE -ne 0) { throw "db:seed failed." }
    }

    Write-Host ""
    Write-Host "==> Verifying row counts..." -ForegroundColor Green
    node (Join-Path $PSScriptRoot 'db-counts.mjs')

    Write-Host ""
    Write-Host "==================== DONE ====================" -ForegroundColor Green
    Write-Host "Schema applied and problem bank seeded."
    Write-Host "Next: set the same DATABASE_URL on the App Service, then restart it." -ForegroundColor Cyan
}
finally {
    Pop-Location
}
