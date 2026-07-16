<#
.SYNOPSIS
    Load neon-setup.sql (schema + problem seed) into a Postgres database via psql.

.DESCRIPTION
    Wraps psql with the correct flag order and UTF-8 encoding so the SQL actually
    runs (a common mistake is putting -f AFTER the connection string, which psql
    silently ignores). Auto-detects psql.exe, optionally resets the schema first,
    runs the file with ON_ERROR_STOP so failures surface, then verifies the count.

.PARAMETER ConnectionString
    Full Postgres URL, e.g.
    postgresql://<user>:<password>@<host>/<db>?sslmode=require

.PARAMETER SqlFile
    Path to the generated SQL (default: .\neon-setup.sql in the current directory).

.PARAMETER Reset
    Drop and recreate the public schema before running (clears partial/old data).

.PARAMETER PsqlPath
    Override the psql.exe path (otherwise auto-detected from PATH or
    C:\Program Files\PostgreSQL\*\bin).

.EXAMPLE
    ./scripts/azure/run-neon.ps1 `
        -ConnectionString 'postgresql://user:pass@host/neondb?sslmode=require' `
        -SqlFile 'C:\path\to\neon-setup.sql' -Reset
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $ConnectionString,
    [string] $SqlFile = (Join-Path (Get-Location) 'neon-setup.sql'),
    [string] $PsqlPath,
    [switch] $Reset,
    [switch] $SkipVerify
)

$ErrorActionPreference = 'Stop'

# --- locate psql.exe -------------------------------------------------------
if (-not $PsqlPath) {
    $cmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($cmd) {
        $PsqlPath = $cmd.Source
    } else {
        $found = Get-ChildItem 'C:\Program Files\PostgreSQL\*\bin\psql.exe' -ErrorAction SilentlyContinue |
            Sort-Object FullName -Descending | Select-Object -First 1
        if ($found) { $PsqlPath = $found.FullName }
    }
}
if (-not $PsqlPath -or -not (Test-Path $PsqlPath)) {
    throw "psql.exe not found. Install PostgreSQL client tools or pass -PsqlPath."
}
if (-not (Test-Path $SqlFile)) {
    throw "SQL file not found: $SqlFile (generate it with scripts/azure/gen-neon-seed.mjs)."
}

# UTF-8 so multibyte characters in the SQL load correctly.
$env:PGCLIENTENCODING = 'UTF8'
Write-Host "psql : $PsqlPath"
Write-Host "file : $SqlFile"

# --- optional reset --------------------------------------------------------
if ($Reset) {
    Write-Host "==> Resetting public schema (drops all objects + data)..." -ForegroundColor Yellow
    & $PsqlPath -v ON_ERROR_STOP=1 `
        -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;" `
        $ConnectionString
    if ($LASTEXITCODE -ne 0) { throw "Schema reset failed (exit $LASTEXITCODE)." }
}

# --- run the file (flags BEFORE the connection string) ---------------------
Write-Host "==> Running $([IO.Path]::GetFileName($SqlFile))..." -ForegroundColor Green
& $PsqlPath -v ON_ERROR_STOP=1 -f $SqlFile $ConnectionString
if ($LASTEXITCODE -ne 0) { throw "psql -f failed (exit $LASTEXITCODE)." }

# --- verify ----------------------------------------------------------------
if (-not $SkipVerify) {
    Write-Host "==> Verifying row counts..." -ForegroundColor Green
    & $PsqlPath -c 'SELECT track, COUNT(*) FROM "Problem" GROUP BY track ORDER BY track;' $ConnectionString
    & $PsqlPath -c 'SELECT COUNT(*) AS total_problems FROM "Problem";' $ConnectionString
}

Write-Host ""
Write-Host "==================== DONE ====================" -ForegroundColor Green
Write-Host "Expected: 38 problems (DSA 12, SYSTEM_DESIGN 6, LLD 12, BEHAVIORAL 8)."
