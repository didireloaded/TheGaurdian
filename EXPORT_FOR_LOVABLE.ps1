# Guardian Project - Lovable.dev Export Script
# Creates a clean, optimized export under 20MB for Lovable.dev

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$exportDir = "lovable-export"

Write-Host "Creating Lovable.dev Export..." -ForegroundColor Cyan
Write-Host "Target: Under 20MB, optimized for Lovable" -ForegroundColor Yellow

# Remove old export if exists
if (Test-Path $exportDir) {
    Remove-Item -Path $exportDir -Recurse -Force
}

# Create export directory
New-Item -ItemType Directory -Path $exportDir -Force | Out-Null

# Copy src directory (exclude unnecessary files)
Write-Host "Copying src/..." -ForegroundColor Green
Copy-Item -Path "src" -Destination "$exportDir\src" -Recurse -Force

# Copy supabase directory
Write-Host "Copying supabase/..." -ForegroundColor Green
Copy-Item -Path "supabase" -Destination "$exportDir\supabase" -Recurse -Force

# Copy public directory if exists (only essential files)
if (Test-Path "public") {
    Write-Host "Copying public/..." -ForegroundColor Green
    New-Item -ItemType Directory -Path "$exportDir\public" -Force | Out-Null
    
    # Only copy essential public files
    $publicFiles = @("favicon.ico", "robots.txt", "placeholder.svg")
    foreach ($file in $publicFiles) {
        if (Test-Path "public\$file") {
            Copy-Item "public\$file" -Destination "$exportDir\public\$file" -Force
        }
    }
}

# Copy essential config files only
Write-Host "Copying configuration files..." -ForegroundColor Green
$essentialFiles = @(
    "package.json",
    "vite.config.ts",
    "tailwind.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "postcss.config.js",
    "eslint.config.js",
    "components.json",
    "index.html"
)

foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Copy-Item $file -Destination "$exportDir\$file" -Force
    }
}

# Create .gitignore
$gitignore = @"
node_modules
dist
.env
.env.local
*.log
.DS_Store
"@
Set-Content -Path "$exportDir\.gitignore" -Value $gitignore

# Create .env.example
$envExample = @"
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_access_token
"@
Set-Content -Path "$exportDir\.env.example" -Value $envExample

# Create README for Lovable
$readme = @"
# Guardian - Community Safety App

Exported for Lovable.dev on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Quick Start on Lovable.dev

1. **Import this folder** into Lovable.dev
2. **Set environment variables** in Lovable settings:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_MAPBOX_TOKEN

3. **Setup Supabase**:
   - Create new Supabase project
   - Run migrations from supabase/migrations/ folder
   - Enable Row Level Security (RLS)
   - Create storage bucket: incident-media

4. **Start developing** - Lovable will auto-install dependencies

## Tech Stack

- React 18.3.1 + TypeScript 5.8.3
- Vite 5.4.19
- Tailwind CSS 3.4.17
- Supabase (Backend)
- Mapbox GL JS 3.15.0
- shadcn/ui components

## Project Structure

- src/pages/ - Route pages
- src/components/ - React components
- src/hooks/ - Custom hooks
- src/lib/ - Utilities
- supabase/migrations/ - Database schema

## Features

- Emergency alerts with GPS
- Live map with incident tracking
- Real-time chat/messaging
- Trip safety tracking
- Community feed
- Profile management
- Emergency contacts directory

---

Built for Namibia's community safety 🇳🇦
"@
Set-Content -Path "$exportDir\README.md" -Value $readme

# Remove unnecessary files to reduce size
Write-Host "Optimizing for size..." -ForegroundColor Yellow

# Remove any .refactored files, review files, etc.
Get-ChildItem -Path $exportDir -Recurse -File | Where-Object {
    $_.Name -match '\.(refactored|review|backup|old|temp)\.tsx?$' -or
    $_.Name -match 'CODE_REVIEW|IMPROVEMENTS|REFACTORING'
} | Remove-Item -Force

# Create ZIP archive
Write-Host "Creating ZIP archive..." -ForegroundColor Green
$zipPath = "LOVABLE_GUARDIAN_$timestamp.zip"
Compress-Archive -Path $exportDir -DestinationPath $zipPath -Force

# Check size
$sizeInMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
$fileCount = (Get-ChildItem -Path $exportDir -Recurse -File | Measure-Object).Count

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Lovable.dev Export Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "ZIP File: $zipPath" -ForegroundColor Yellow
Write-Host "Size: $sizeInMB MB" -ForegroundColor Yellow
Write-Host "Files: $fileCount" -ForegroundColor Yellow
Write-Host "Status: $(if ($sizeInMB -lt 20) { 'READY FOR LOVABLE' } else { 'WARNING: Over 20MB' })" -ForegroundColor $(if ($sizeInMB -lt 20) { 'Green' } else { 'Red' })
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to lovable.dev" -ForegroundColor White
Write-Host "2. Create new project or open existing" -ForegroundColor White
Write-Host "3. Upload $zipPath" -ForegroundColor White
Write-Host "4. Set environment variables in Lovable settings" -ForegroundColor White
Write-Host "5. Setup Supabase project" -ForegroundColor White
Write-Host ""
