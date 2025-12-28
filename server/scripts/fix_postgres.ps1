# fix_postgres.ps1
# Temporarily set local auth to 'trust', set postgres password, create gearguard DB, restore auth
$ErrorActionPreference = 'Stop'

$pg_hba = 'C:\Program Files\PostgreSQL\18\data\pg_hba.conf'
$bak = "$pg_hba.bak_$(Get-Date -Format yyyyMMddHHmmss)"
Write-Output "Backing up $pg_hba to $bak"
Copy-Item $pg_hba $bak -Force

Write-Output "Modifying pg_hba to use 'trust' for local connections (temporary)"
$lines = Get-Content $pg_hba
$modified = $lines | ForEach-Object {
    if ($_ -match '^\s*local\s+all\s+all\s+\w+') { $_ -replace '\b\w+$','trust' }
    elseif ($_ -match '^\s*host\s+all\s+all\s+127\.0\.0\.1/32\s+\w+') { $_ -replace '\b\w+$','trust' }
    elseif ($_ -match '^\s*host\s+all\s+all\s+::1/128\s+\w+') { $_ -replace '\b\w+$','trust' }
    else { $_ }
}
$modified | Set-Content $pg_hba -Encoding Ascii

Write-Output 'Restarting PostgreSQL service...'
Restart-Service -Name postgresql-x64-18 -Force
Start-Sleep -Seconds 4

Write-Output 'Setting postgres user password to "postgres" and creating database gearguard if missing'
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -U postgres -h 127.0.0.1 -c "ALTER USER postgres WITH PASSWORD 'postgres';"
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -U postgres -h 127.0.0.1 -c "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gearguard') THEN CREATE DATABASE gearguard; END IF; END $$;"

Write-Output 'Restoring original pg_hba.conf and restarting service'
Copy-Item $bak $pg_hba -Force
Restart-Service -Name postgresql-x64-18 -Force
Start-Sleep -Seconds 4

Write-Output 'Verifying connection and listing databases (using password)'
$env:PGPASSWORD = 'postgres'
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h 127.0.0.1 -U postgres -c "\l"

Write-Output 'Done.'
