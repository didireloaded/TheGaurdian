# Guardian Project - Complete Code Export Script
# This script creates a complete backup of all source code

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$exportDir = "GUARDIAN_EXPORT_$timestamp"

Write-Host "🚀 Starting Guardian Project Export..." -ForegroundColor Cyan
Write-Host "📦 Creating export directory: $exportDir" -ForegroundColor Yellow

# Create export directory
New-Item -ItemType Directory -Path $exportDir -Force | Out-Null

# Function to copy directory with exclusions
function Copy-ProjectFiles {
    param (
        [string]$Source,
        [string]$Destination
    )
    
    $exclude = @('node_modules', '.git', 'dist', 'build', '.next', '.cache', 'bun.lockb', 'package-lock.json')
    
    Get-ChildItem -Path $Source -Recurse | Where-Object {
        $item = $_
        $shouldExclude = $false
        foreach ($pattern in $exclude) {
            if ($item.FullName -like "*\$pattern\*" -or $item.Name -eq $pattern) {
                $shouldExclude = $true
                break
            }
        }
        -not $shouldExclude
    } | ForEach-Object {
        $targetPath = $_.FullName.Replace($Source, $Destination)
        $targetDir = Split-Path -Parent $targetPath
        
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        
        if (-not $_.PSIsContainer) {
            Copy-Item $_.FullName -Destination $targetPath -Force
        }
    }
}

# Copy all source files
Write-Host "📁 Copying src/ directory..." -ForegroundColor Green
Copy-ProjectFiles -Source "src" -Destination "$exportDir\src"

# Copy supabase files
Write-Host "🗄️  Copying supabase/ directory..." -ForegroundColor Green
Copy-ProjectFiles -Source "supabase" -Destination "$exportDir\supabase"

# Copy public files
Write-Host "🖼️  Copying public/ directory..." -ForegroundColor Green
if (Test-Path "public") {
    Copy-ProjectFiles -Source "public" -Destination "$exportDir\public"
}

# Copy configuration files
Write-Host "⚙️  Copying configuration files..." -ForegroundColor Green
$configFiles = @(
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
    ".gitignore",
    "README.md"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Copy-Item $file -Destination "$exportDir\$file" -Force
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}

# Create .env.example
Write-Host "Creating .env.example..." -ForegroundColor Green
$envContent = "# Supabase Configuration`nVITE_SUPABASE_URL=your_supabase_project_url`nVITE_SUPABASE_ANON_KEY=your_supabase_anon_key`n`n# Mapbox Configuration`nVITE_MAPBOX_TOKEN=your_mapbox_access_token"
Set-Content -Path "$exportDir\.env.example" -Value $envContent

# Create README for the export
Write-Host "Creating export README..." -ForegroundColor Green
$readmeContent = "# Guardian Project - Complete Code Export`n`nExport created on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n## Quick Start`n`n1. npm install`n2. Copy .env.example to .env and fill in credentials`n3. Setup Supabase project and run migrations`n4. npm run dev`n`n## Tech Stack`n- React 18.3.1 + TypeScript 5.8.3`n- Vite 5.4.19`n- Tailwind CSS 3.4.17`n- Supabase Backend`n- Mapbox GL JS 3.15.0`n`nSee COMPLETE_PROJECT_EXPORT.md for full documentation."
Set-Content -Path "$exportDir\README.md" -Value $readmeContent

# Create file list
Write-Host "📋 Creating file inventory..." -ForegroundColor Green
$files = Get-ChildItem -Path $exportDir -Recurse -File | Select-Object -ExpandProperty FullName
$fileList = $files | ForEach-Object { $_.Replace("$exportDir\", "") }
Set-Content -Path "$exportDir\FILE_LIST.txt" -Value $fileList

# Create archive
Write-Host "🗜️  Creating ZIP archive..." -ForegroundColor Green
$zipPath = "$exportDir.zip"
Compress-Archive -Path $exportDir -DestinationPath $zipPath -Force

# Summary
Write-Host "`n✅ Export Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📦 Export Directory: $exportDir" -ForegroundColor Yellow
Write-Host "🗜️  ZIP Archive: $zipPath" -ForegroundColor Yellow
Write-Host "📊 Total Files: $(Get-ChildItem -Path $exportDir -Recurse -File | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Yellow
Write-Host "💾 Total Size: $([math]::Round((Get-ChildItem -Path $exportDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)) MB" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "`n🎉 Your complete codebase is ready to move to a new project!" -ForegroundColor Green
Write-Host "📖 Check the README.md in the export folder for setup instructions" -ForegroundColor Gray
