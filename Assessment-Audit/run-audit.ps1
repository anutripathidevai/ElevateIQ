<#
.SYNOPSIS
Run the complete assessment evidence pipeline.
.DESCRIPTION
Uses the project-local virtualenv when present. -Setup explicitly creates that
environment and installs pinned requirements. No global installation is performed.
Native execution requires a confirmation or -AllowNativeExecution for unattended use.
.EXAMPLE
.\run-audit.ps1
.EXAMPLE
.\run-audit.ps1 -Setup -AssessmentRoot 'C:\assessment'
#>
[CmdletBinding()]
param(
    [string]$AssessmentRoot,
    [string]$Config,
    [string]$Python,
    [switch]$Setup,
    [switch]$AllowNativeExecution,
    [switch]$StaticOnly,
    [switch]$ReportOnly
)

$ErrorActionPreference = 'Stop'
$project = $PSScriptRoot
$environmentPython = Join-Path $project '.venv\Scripts\python.exe'
try {
    if (-not $Config) { $Config = Join-Path $project 'audit-config.json' }
    if (-not [IO.Path]::IsPathRooted($Config)) { $Config = Join-Path $project $Config }
    if (-not (Test-Path -LiteralPath $Config -PathType Leaf)) { throw "Configuration absent: $Config" }
    $settings = Get-Content -LiteralPath $Config -Raw | ConvertFrom-Json
    $pythonArgs = @()
    if ($Python) {
        $executable = $Python
    } elseif (Test-Path -LiteralPath $environmentPython) {
        $executable = $environmentPython
    } elseif (Get-Command py -CommandType Application -ErrorAction SilentlyContinue) {
        $executable = (Get-Command py -CommandType Application).Source
        $pythonArgs = @('-3')
    } elseif (Get-Command python -CommandType Application -ErrorAction SilentlyContinue) {
        $executable = (Get-Command python -CommandType Application).Source
    } else {
        throw 'Python 3.10+ not found. Install Python, then run .\run-audit.ps1 -Setup.'
    }
    & $executable @pythonArgs -c "import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)"
    if ($LASTEXITCODE -ne 0) { throw 'Python 3.10+ is required, or the selected interpreter could not start.' }
    if ($Setup) {
        if (-not (Test-Path -LiteralPath $environmentPython)) {
            & $executable @pythonArgs -m venv (Join-Path $project '.venv')
            if ($LASTEXITCODE -ne 0) { throw 'Failed to create the project-local virtualenv.' }
        }
        & $environmentPython -m pip install -r (Join-Path $project 'requirements.txt')
        if ($LASTEXITCODE -ne 0) { throw 'Dependency setup failed. No audit was started.' }
        $executable = $environmentPython
        $pythonArgs = @()
    }
    if ($StaticOnly -and $ReportOnly) { throw 'Choose either -StaticOnly or -ReportOnly, not both.' }
    $needsNative = -not $ReportOnly -and -not $StaticOnly -and ($settings.run_baseline -ne $false -or @($settings.probes).Count -gt 0)
    if ($needsNative) {
        if ([Environment]::OSVersion.Platform -eq [PlatformID]::Win32NT) {
            $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
            $principal = New-Object Security.Principal.WindowsPrincipal($identity)
            if ($principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
                throw 'Native assessment code must not run in an elevated PowerShell. Use a standard-user shell in a disposable VM.'
            }
        }
        Write-Warning 'Native execution is NOT a sandbox. Supplied code has your account permissions. Use a disposable VM without credentials.'
        if (-not $AllowNativeExecution) {
            $answer = Read-Host 'Run supplied assessment code in this environment? Type RUN to confirm'
            if ($answer -cne 'RUN') { throw 'Native execution not authorized. No assessment code was started.' }
            $AllowNativeExecution = $true
        }
    }
    $arguments = @((Join-Path $project 'audit\main.py'), '--config', $Config)
    if ($AssessmentRoot) { $arguments += @('--root', $AssessmentRoot) }
    if ($AllowNativeExecution) { $arguments += '--allow-native-execution' }
    if ($StaticOnly) { $arguments += '--static-only' }
    if ($ReportOnly) { $arguments += '--report-only' }
    & $executable @pythonArgs @arguments
    $code = $LASTEXITCODE
    switch ($code) {
        0 { Write-Host 'Audit completed. No non-informational candidate findings.' }
        1 { Write-Host 'Audit completed with candidate findings. Manual verification is pending.' }
        2 { Write-Warning 'Audit partially completed or blocked. Read summary.md; unavailable evaluations are not model failures.' }
        3 { Write-Warning 'Audit-tool/preflight error. Diagnostics above and any generated logs describe the blocker.' }
        130 { Write-Warning 'Audit interrupted. Read preserved partial evidence when available.' }
        default { Write-Warning "Unexpected Python exit code: $code" }
    }
    exit $code
} catch {
    Write-Error -ErrorAction Continue $_.Exception.Message
    exit 3
}
