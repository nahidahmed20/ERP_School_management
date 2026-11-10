$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$publicBuild = Join-Path $projectRoot 'public/build'
$manifestPath = Join-Path $publicBuild 'manifest.json'
$releaseDirectory = Join-Path $PSScriptRoot 'releases'

Push-Location $projectRoot
try {
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) {
        throw "Vite build failed with exit code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
}

if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    throw "Vite manifest was not created: $manifestPath"
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $manifest.'resources/js/app.jsx') {
    throw 'The Vite manifest does not contain the application entry.'
}

foreach ($entry in $manifest.PSObject.Properties) {
    $assets = @()
    if ($entry.Value.file) { $assets += $entry.Value.file }
    if ($entry.Value.css) { $assets += $entry.Value.css }

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
        'app', 'bootstrap', 'config', 'database', 'lang', 'public', 'resources', 'routes',
        'artisan', '.htaccess', '.env.example', 'composer.json', 'composer.lock'
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
            if ($zipPath -match '(^|/)hot$|(^|/)storage(/|$)' -and $zipPath -like 'public/*') { continue }
            if ($zipPath -match '\.(sqlite|sqlite3)$') { continue }

            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive,
                $file.FullName,
                $zipPath,
                [System.IO.Compression.CompressionLevel]::Optimal
            ) | Out-Null
        }
    }
}
finally {
    $archive.Dispose()
}

Write-Output "Release ready: $archivePath"
Write-Output 'The archive excludes .env, vendor, node_modules, storage, tests, and local databases.'
