$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$publicBuild = Join-Path $projectRoot 'public/build'
$manifestPath = Join-Path $publicBuild 'manifest.json'
$vendorAutoload = Join-Path $projectRoot 'vendor/autoload.php'
$releaseDirectory = Join-Path $PSScriptRoot 'releases'

if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    throw "Production build is missing: $manifestPath. Run npm run build first."
}

if (-not (Test-Path -LiteralPath $vendorAutoload -PathType Leaf)) {
    throw "Composer dependencies are missing: $vendorAutoload. Run composer install first."
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $manifest.'resources/js/app.jsx') {
    throw 'The Vite manifest does not contain the application entry.'
}

foreach ($entry in $manifest.PSObject.Properties) {
    $assets = @()
    if ($entry.Value.file) { $assets += $entry.Value.file }
    if ($entry.Value.css) { $assets += $entry.Value.css }
    if ($entry.Value.assets) { $assets += $entry.Value.assets }

    foreach ($asset in $assets) {
        $assetPath = Join-Path $publicBuild ($asset -replace '/', [IO.Path]::DirectorySeparatorChar)
        if (-not (Test-Path -LiteralPath $assetPath -PathType Leaf)) {
            throw "Manifest asset is missing: $assetPath"
        }
    }
}

New-Item -ItemType Directory -Path $releaseDirectory -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$archivePath = Join-Path $releaseDirectory "erp-school-cpanel-$stamp.zip"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::Open($archivePath, [System.IO.Compression.ZipArchiveMode]::Create)

try {
    $includedPaths = @(
        'app', 'bootstrap', 'config', 'database', 'lang', 'public', 'resources', 'routes', 'vendor',
        'artisan', '.htaccess', '.env.example', 'composer.json', 'composer.lock',
        'package.json', 'package-lock.json', 'vite.config.js', 'tailwind.config.js', 'postcss.config.js', 'jsconfig.json'
    )

    foreach ($relativePath in $includedPaths) {
        $sourcePath = Join-Path $projectRoot $relativePath
        if (-not (Test-Path -LiteralPath $sourcePath)) { continue }

        if (Test-Path -LiteralPath $sourcePath -PathType Container) {
            $files = Get-ChildItem -LiteralPath $sourcePath -Recurse -File
        } else {
            $files = @(Get-Item -LiteralPath $sourcePath)
        }

        foreach ($file in $files) {
            $localPath = $file.FullName.Substring($projectRoot.Length).TrimStart('\', '/')
            $zipPath = $localPath -replace '\\', '/'

            if ($zipPath -match '(^|/)\.env($|\.)' -and $zipPath -ne '.env.example') { continue }
            if ($zipPath -match '^public/storage(/|$)|^public/hot$') { continue }
            if ($zipPath -match '^bootstrap/cache/' -and $zipPath -ne 'bootstrap/cache/.gitignore') { continue }
            if (($file.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { continue }
            if ($zipPath -match '\.(sqlite|sqlite3)$') { continue }

            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive,
                $file.FullName,
                $zipPath,
                [System.IO.Compression.CompressionLevel]::Fastest
            ) | Out-Null
        }
    }

    $instructions = @'
Production upload steps:
1. Back up the live database and current project files.
2. Extract this archive into the Laravel project root, preserving the server's .env and storage/ data.
3. Delete public/hot if it exists; it makes Laravel load a development server instead of these built assets.
4. Ensure storage/ and bootstrap/cache/ are writable by PHP.
5. In the project root run: php artisan migrate --force
6. Then run: php artisan optimize:clear
7. Check the site. Keep the existing production APP_KEY and database settings in .env.

The archive includes vendor/ and public/build/. It intentionally excludes .env, storage data,
local database files, node_modules, tests, and bootstrap/cache runtime files.
'@
    $instructionsEntry = $archive.CreateEntry('DEPLOY-INSTRUCTIONS.txt')
    $instructionsStream = $instructionsEntry.Open()
    try {
        $instructionsBytes = [Text.UTF8Encoding]::new($false).GetBytes($instructions)
        $instructionsStream.Write($instructionsBytes, 0, $instructionsBytes.Length)
    }
    finally {
        $instructionsStream.Dispose()
    }
}
finally {
    $archive.Dispose()
}

Write-Output "Release ready: $archivePath"
Write-Output 'The archive includes the production vendor dependencies and public/build assets.'
Write-Output 'It excludes .env, storage data, public/storage, node_modules, tests, and local databases.'
