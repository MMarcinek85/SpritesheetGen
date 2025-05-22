# Script to run webpack with visible output
Write-Host "Running webpack with verbose output..." -ForegroundColor Cyan
$env:NODE_ENV = "development"

# Add this to ensure output is not truncated
$BufferHeight = 9999
$Host.UI.RawUI.BufferSize = New-Object System.Management.Automation.Host.Size(120, $BufferHeight)

Write-Host "`n=== WEBPACK BUILD OUTPUT ===`n" -ForegroundColor Yellow
npx webpack --color --progress 2>&1 | ForEach-Object { Write-Host $_ }

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Webpack build succeeded!`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Webpack build failed with exit code $LASTEXITCODE`n" -ForegroundColor Red
}
