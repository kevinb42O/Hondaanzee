# Quick and dirty WebP compression using online tool cwebp if available
# Or manual instructions

Write-Host "Checking for cwebp (Google WebP tools)..." -ForegroundColor Cyan

$cwebpPath = Get-Command cwebp -ErrorAction SilentlyContinue

if ($cwebpPath) {
    Write-Host "Found cwebp! Compressing files..." -ForegroundColor Green
    Write-Host ""
    
    $publicDir = Join-Path $PSScriptRoot 'public'
    $files = @('bistraliva.webp', 'brouwerijstraatbredene.webp', 'bistrothuus.webp')
    
    foreach ($file in $files) {
        $inputPath = Join-Path $publicDir $file
        $outputPath = Join-Path $publicDir "compressed_$file"
        
        if (Test-Path $inputPath) {
            $originalSize = (Get-Item $inputPath).Length / 1MB
            Write-Host "Compressing $file ($([math]::Round($originalSize, 2)) MB)..."
            
            # Compress with quality 80
            & cwebp -q 80 "$inputPath" -o "$outputPath"
            
            if (Test-Path $outputPath) {
                $newSize = (Get-Item $outputPath).Length / 1MB
                Remove-Item $inputPath
                Rename-Item $outputPath $file
                Write-Host "  SUCCESS: $([math]::Round($originalSize, 2)) MB -> $([math]::Round($newSize, 2)) MB" -ForegroundColor Green
            }
        }
        Write-Host ""
    }
} else {
    Write-Host "cwebp not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "MANUAL FIX OPTIONS:" -ForegroundColor Yellow
    Write-Host "==================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Install Google WebP tools:" -ForegroundColor Cyan
    Write-Host "   Download from: https://developers.google.com/speed/webp/download"
    Write-Host "   Or via Chocolatey: choco install webp"
    Write-Host ""
    Write-Host "2. Use online tool:" -ForegroundColor Cyan
    Write-Host "   https://squoosh.app/"
    Write-Host "   - Upload these files from /public:"
    Write-Host "     * bistraliva.webp (6.6 MB)"
    Write-Host "     * brouwerijstraatbredene.webp (6.24 MB)"
    Write-Host "     * bistrothuus.webp (2.36 MB)"
    Write-Host "   - Set WebP quality to 80"
    Write-Host "   - Download and replace originals"
    Write-Host ""
    Write-Host "3. PhotoShop / GIMP:" -ForegroundColor Cyan
    Write-Host "   - Open each file"
    Write-Host "   - Export as WebP with quality 75-85"
    Write-Host ""
}
