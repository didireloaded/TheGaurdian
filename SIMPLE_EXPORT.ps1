# Guardian Project - Simple Code Export Script

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$exportDir = "GUARDIAN_EXPORT_$timestamp"

Write-Host "Starting Guardian Project Export..." -ForegroundColor Cyan

# Create export directory
New-Item -ItemType Directory -Path $exportDir -Force | Out-Null

# Copy src directory
Write-Host "Copying src/..." -ForegroundColor Green
Copy-Item -Path "src" -Destination "$exportDir\src" -Recurse -Force

# Copy supabase directory
Write-Host "Copying supabase/..." -ForegroundColor Green
Copy-Item -Path "supabase" -Destination "$exportDir\supabase" -Recurse -Force

# Copy public directory if exists
if (Test-Path "public") {
    Write-Host "Copying public/..." -ForegroundColor Green
    Copy-Item -Path "public" -Destination "$exportDir\public" -Recurse -Force
}

# Copy config files
Write-Host "Copying configuration files..." -ForegroundColor Green
$files = @(
    "package.json",
    "vite.config.ts",
    "tailwind.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "postcss.config.js",
    "eslint.config.js",
    "components.json",
    "index.html",
    ".gitignore"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item $file -Destination "$exportDir\$file" -Force
    }
}

# Copy documentation
if (Test-Path "COMPLETE_PROJECT_EXPORT.md") {
    Copy-Item "COMPLETE_PROJECT_EXPORT.md" -Destination "$exportDir\" -Force
}

# Create .env.example
$envExample = @"
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox Configuration
VITE_MAPBOX_TOKEN=your_mapbox_access_token
"@
Set-Content -Path "$exportDir\.env.example" -Value $envExample

# Create README
$readme = @"
# Guardian Project - Code Export

Export Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Quick Start

1. Install dependencies:
   npm install

2. Setup environment:
   Copy .env.example to .env and fill in your credentials

3. Setup Supabase:
   - Create new Supabase project
   - Run migrations from supabase/migrations/
   - Configure RLS policies

4. Start development:
   npm run dev

## What's Included

- Complete source code (src/)
- Database migrations (supabase/)
- Static assets (public/)
- All configuration files
- Full documentation

See COMPLETE_PROJECT_EXPORT.md for detailed information.

---
Guardian - Community Safety App for Namibia
"@
Set-Content -Path "$exportDir\README.md" -Value $readme

# Create ZIP archive
Write-Host "Creating ZIP archive..." -ForegroundColor Green
$zipPath = "$exportDir.zip"
Compress-Archive -Path $exportDir -DestinationPath $zipPath -Force

# Summary
$fileCount = (Get-ChildItem -Path $exportDir -Recurse -File | Measure-Object).Count
$sizeInMB = [math]::Round((Get-ChildItem -Path $exportDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)

Write-Host ""
Write-Host "Export Complete!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Export Directory: $exportDir" -ForegroundColor Yellow
Write-Host "ZIP Archive: $zipPath" -ForegroundColor Yellow
Write-Host "Total Files: $fileCount" -ForegroundColor Yellow
Write-Host "Total Size: $sizeInMB MB" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your complete codebase is ready!" -ForegroundColor Green
