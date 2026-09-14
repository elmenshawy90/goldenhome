# Run as Administrator once:
# powershell -ExecutionPolicy Bypass -File "D:\Goldenhome\scripts\fix-postgres-admin.ps1"

$ErrorActionPreference = "Stop"
$PgBin = "C:\Program Files\PostgreSQL\17\bin"
$DataDir = "C:\Program Files\PostgreSQL\17\data"
$Hba = Join-Path $DataDir "pg_hba.conf"
$Backup = "$Hba.bak.$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Must be admin
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) { throw "Please re-run this PowerShell as Administrator (right-click -> Run as administrator)." }

Write-Host "==> Backup to $Backup"
Copy-Item -LiteralPath $Hba -Destination $Backup -Force

Write-Host "==> Trust mode"
(Get-Content -LiteralPath $Hba) -replace 'scram-sha-256', 'trust' | Set-Content -LiteralPath $Hba -Encoding ASCII
Restart-Service -Name "postgresql-x64-17" -Force
Start-Sleep -Seconds 4

$env:PGPASSWORD = ""
Write-Host "==> Reset postgres password to 'postgres'"
& "$PgBin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -c "ALTER USER postgres WITH PASSWORD 'postgres';"
if ($LASTEXITCODE -ne 0) { throw "ALTER postgres failed" }

Write-Host "==> Create role goldenhome"
$roleExists = & "$PgBin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -t -A -c "SELECT 1 FROM pg_roles WHERE rolname='goldenhome';"
if ($roleExists -match "1") {
  & "$PgBin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -c "ALTER ROLE goldenhome WITH LOGIN PASSWORD 'goldenhome123' CREATEDB;"
} else {
  & "$PgBin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -c "CREATE ROLE goldenhome WITH LOGIN PASSWORD 'goldenhome123' CREATEDB;"
}

Write-Host "==> Refresh collation (fixes Windows ICU 1540->1541 mismatch)"
& "$PgBin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -c "ALTER DATABASE template1 REFRESH COLLATION VERSION; ALTER DATABASE postgres REFRESH COLLATION VERSION;"

Write-Host "==> Create database goldenhome"
$dbExists = & "$PgBin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -t -A -c "SELECT 1 FROM pg_database WHERE datname='goldenhome';"
if ($dbExists -match "1") {
  Write-Host "Database already exists, skipping createdb"
} else {
  & "$PgBin\createdb.exe" -U postgres -h 127.0.0.1 -p 5432 -O goldenhome goldenhome
}
& "$PgBin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE goldenhome TO goldenhome;"

Write-Host "==> Restore scram-sha-256"
Copy-Item -LiteralPath $Backup -Destination $Hba -Force
Restart-Service -Name "postgresql-x64-17" -Force
Start-Sleep -Seconds 3

Write-Host "==> Verify"
$env:PGPASSWORD = "goldenhome123"
& "$PgBin\psql.exe" -U goldenhome -h 127.0.0.1 -p 5432 -d goldenhome -c "SELECT version();"
if ($LASTEXITCODE -ne 0) { throw "Verify failed - still cannot connect as goldenhome" }

Write-Host ""
Write-Host "OK! Now run in normal terminal: npm run db:setup"
