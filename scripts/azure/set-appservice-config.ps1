<#
.SYNOPSIS
    Set ElevateIQ environment variables on the Azure App Service and restart it.

.DESCRIPTION
    Writes DATABASE_URL (+ AUTH_SECRET, AUTH_URL, and any optional keys you pass)
    into the App Service application settings, then restarts the app so it picks
    them up. Application settings are encrypted at rest and injected as env vars.

    - AUTH_SECRET: required in production (Auth.js throws MissingSecret without it).
      A strong value is generated if you do not supply one.
    - AUTH_URL:    defaults to https://<app>.azurewebsites.net (from the app's
      default host name) unless you pass -AuthUrl.

.PREREQUISITES
    - Azure CLI logged in (az login) with access to the App Service.

.EXAMPLE
    ./scripts/azure/set-appservice-config.ps1 `
        -ResourceGroup rg-elevateiq `
        -AppName elevateiq-web `
        -DatabaseUrl $env:DATABASE_URL

.EXAMPLE
    ./scripts/azure/set-appservice-config.ps1 -ResourceGroup rg-elevateiq -AppName elevateiq-web `
        -DatabaseUrl $env:DATABASE_URL `
        -AzureOpenAiEndpoint 'https://<res>.openai.azure.com' -AzureOpenAiApiKey '<key>'
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $ResourceGroup,
    [Parameter(Mandatory)] [string] $AppName,
    [Parameter(Mandatory)] [string] $DatabaseUrl,
    [string] $AuthSecret,
    [string] $AuthUrl,
    [string] $AzureOpenAiEndpoint,
    [string] $AzureOpenAiApiKey,
    [string] $AzureOpenAiDeployment = 'gpt-4o-mini',
    [string] $AzureOpenAiApiVersion = '2024-08-01-preview',
    [switch] $NoRestart
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    throw "Azure CLI (az) not found. Install it and run 'az login' first."
}

# Default AUTH_URL from the app's real default host name.
if (-not $AuthUrl) {
    $defaultHost = az webapp show -g $ResourceGroup -n $AppName --query defaultHostName -o tsv
    if (-not $defaultHost) { throw "Could not read App Service '$AppName' in '$ResourceGroup'. Check the names." }
    $AuthUrl = "https://$defaultHost"
}

# Generate AUTH_SECRET if not supplied (32 random bytes, base64 — matches `openssl rand -base64 32`).
if (-not $AuthSecret) {
    $bytes = New-Object 'System.Byte[]' 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $AuthSecret = [Convert]::ToBase64String($bytes)
    Write-Host "Generated AUTH_SECRET (stored in App Service settings)." -ForegroundColor Yellow
}

# Build the settings list as KEY=VALUE tokens.
$settings = @(
    "DATABASE_URL=$DatabaseUrl",
    "AUTH_SECRET=$AuthSecret",
    "AUTH_URL=$AuthUrl"
)
if ($AzureOpenAiEndpoint) { $settings += "AZURE_OPENAI_ENDPOINT=$AzureOpenAiEndpoint" }
if ($AzureOpenAiApiKey)   { $settings += "AZURE_OPENAI_API_KEY=$AzureOpenAiApiKey" }
if ($AzureOpenAiEndpoint -and $AzureOpenAiApiKey) {
    $settings += "AZURE_OPENAI_DEPLOYMENT=$AzureOpenAiDeployment"
    $settings += "AZURE_OPENAI_API_VERSION=$AzureOpenAiApiVersion"
}

Write-Host "==> Applying $($settings.Count) app settings to '$AppName'..." -ForegroundColor Green
Write-Host "    DATABASE_URL: $($DatabaseUrl -replace '://([^:]+):[^@]+@', '://$1:****@')" -ForegroundColor DarkGray
Write-Host "    AUTH_URL:     $AuthUrl" -ForegroundColor DarkGray

az webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $AppName `
    --settings $settings -o none

if (-not $NoRestart) {
    Write-Host "==> Restarting '$AppName'..." -ForegroundColor Green
    az webapp restart --resource-group $ResourceGroup --name $AppName -o none
}

Write-Host ""
Write-Host "==================== DONE ====================" -ForegroundColor Green
Write-Host "App settings updated$( if ($NoRestart) { ' (restart skipped)' } else { ' and app restarted' } )."
Write-Host "Validate: ./scripts/azure/validate-db.ps1 -AppUrl $AuthUrl" -ForegroundColor Cyan
