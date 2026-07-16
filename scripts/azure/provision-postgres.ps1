<#
.SYNOPSIS
    Provision an Azure Database for PostgreSQL Flexible Server for ElevateIQ.

.DESCRIPTION
    Creates a Burstable B1ms PostgreSQL 16 Flexible Server + database, opens the
    firewall to Azure services (so the App Service can connect) and to your
    current public IP (so you can run migrations from this machine), then prints
    the DATABASE_URL to use.

    Idempotent-ish: re-running with the same names is safe for the firewall rules
    (they are upserted); server creation will error if the server already exists,
    which you can ignore.

.PREREQUISITES
    - Azure CLI (`az`) installed and logged in:  az login
    - A subscription selected:                   az account set --subscription <id>

.EXAMPLE
    ./scripts/azure/provision-postgres.ps1 `
        -ResourceGroup rg-elevateiq `
        -Location eastus `
        -ServerName elevateiq-pg-9f3a `
        -AdminUser eiqadmin `
        -AdminPassword 'S0me-Str0ng-P@ss!'
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $ResourceGroup,
    [Parameter(Mandatory)] [string] $ServerName,     # globally unique, lowercase, 3-63 chars
    [string] $Location      = 'eastus',
    [string] $AdminUser     = 'eiqadmin',
    [string] $AdminPassword,                          # if omitted, a strong one is generated
    [string] $DatabaseName  = 'elevateiq',
    [string] $Sku           = 'Standard_B1ms',
    [string] $Tier          = 'Burstable',
    [string] $PgVersion     = '16',
    [int]    $StorageGb     = 32
)

$ErrorActionPreference = 'Stop'

function Assert-Az {
    if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
        throw "Azure CLI (az) not found. Install it and run 'az login' first."
    }
    $acct = az account show --query '{name:name, id:id}' -o json 2>$null | ConvertFrom-Json
    if (-not $acct) { throw "Not logged in. Run 'az login' (and 'az account set --subscription <id>')." }
    Write-Host "Using subscription: $($acct.name) ($($acct.id))" -ForegroundColor Cyan
}

Assert-Az

if (-not $AdminPassword) {
    # Generate a 24-char password that satisfies Postgres complexity requirements.
    Add-Type -AssemblyName System.Web
    $AdminPassword = [System.Web.Security.Membership]::GeneratePassword(24, 4)
    Write-Host "Generated admin password (save it now, it is not stored):" -ForegroundColor Yellow
    Write-Host "  $AdminPassword" -ForegroundColor Yellow
}

# 1) Resource group (no-op if it already exists)
Write-Host "==> Ensuring resource group '$ResourceGroup' in '$Location'..." -ForegroundColor Green
az group create --name $ResourceGroup --location $Location -o none

# 2) Flexible Server + database. Public networking on, no firewall rules yet.
Write-Host "==> Creating PostgreSQL Flexible Server '$ServerName' (this can take a few minutes)..." -ForegroundColor Green
az postgres flexible-server create `
    --resource-group $ResourceGroup `
    --name $ServerName `
    --location $Location `
    --admin-user $AdminUser `
    --admin-password $AdminPassword `
    --sku-name $Sku `
    --tier $Tier `
    --version $PgVersion `
    --storage-size $StorageGb `
    --database-name $DatabaseName `
    --public-access None `
    --yes -o none

# 3) Firewall: allow other Azure services (App Service) via the 0.0.0.0 sentinel rule.
Write-Host "==> Allowing Azure services (App Service) through the firewall..." -ForegroundColor Green
az postgres flexible-server firewall-rule create `
    --resource-group $ResourceGroup `
    --name $ServerName `
    --rule-name AllowAzureServices `
    --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0 -o none

# 4) Firewall: allow THIS machine (temporary — remove after migrations, see runbook).
$myIp = (Invoke-RestMethod -Uri 'https://api.ipify.org').Trim()
Write-Host "==> Allowing your current IP ($myIp) for one-time migration..." -ForegroundColor Green
az postgres flexible-server firewall-rule create `
    --resource-group $ResourceGroup `
    --name $ServerName `
    --rule-name TempLocalMigrate `
    --start-ip-address $myIp --end-ip-address $myIp -o none

# 5) Compose DATABASE_URL (URL-encode the password for special characters).
Add-Type -AssemblyName System.Web
$encPass = [System.Web.HttpUtility]::UrlEncode($AdminPassword)
$fqdn = "$ServerName.postgres.database.azure.com"
$databaseUrl = "postgresql://$AdminUser`:$encPass@$fqdn`:5432/$DatabaseName`?sslmode=require"

Write-Host ""
Write-Host "==================== DONE ====================" -ForegroundColor Green
Write-Host "Server FQDN : $fqdn"
Write-Host "Database    : $DatabaseName"
Write-Host ""
Write-Host "DATABASE_URL (use for migrate/seed and App Service config):" -ForegroundColor Cyan
Write-Host "  $databaseUrl"
Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  1) `$env:DATABASE_URL = '<the value above>'"
Write-Host "  2) ./scripts/azure/migrate-and-seed.ps1"
Write-Host "  3) ./scripts/azure/set-appservice-config.ps1 -ResourceGroup $ResourceGroup -AppName <your-app> -DatabaseUrl `$env:DATABASE_URL"
Write-Host "  4) ./scripts/azure/validate-db.ps1 -AppUrl https://<your-app>.azurewebsites.net"
Write-Host "  5) Remove the temp firewall rule once migrations succeed:" -ForegroundColor Yellow
Write-Host "     az postgres flexible-server firewall-rule delete -g $ResourceGroup -n $ServerName -r TempLocalMigrate --yes"
