# Compress large WebP files to reduce size
# This script uses ImageMagick to recompress WebP files with better quality/size ratio

Write-Host "Compressing large WebP files..." -ForegroundColor Cyan
Write-Host ""

# List of files to compress (larger than 2MB)
$filesToCompress = @(
    'bistraliva.webp',
    'brouwerijstraatbredene.webp',
    'bistrothuus.webp'
)

$publicDir = Join-Path $PSScriptRoot 'public'

foreach ($file in $filesToCompress) {
    $inputPath = Join-Path $publicDir $file
    $tempPath = Join-Path $publicDir "temp_$file"
    
    if (Test-Path $inputPath) {
        $originalSize = (Get-Item $inputPath).Length / 1MB
        Write-Host "Processing: $file ($([math]::Round($originalSize, 2)) MB)"
        
        try {
            # Recompress with quality 80 (good balance between quality and size)
            & magick convert "$inputPath" -quality 80 -define webp:method=6 "$tempPath"
            
            if (Test-Path $tempPath) {
                $newSize = (Get-Item $tempPath).Length / 1MB
                $savings = $originalSize - $newSize
                $percentSaved = ($savings / $originalSize) * 100
                
                # Only replace if we saved at least 10 percent space
                if ($percentSaved -gt 10) {
                    Remove-Item $inputPath
                    Rename-Item $tempPath $file
                    $savedPct = [math]::Round($percentSaved, 1)
                    Write-Host "  SUCCESS: Compressed from $([math]::Round($originalSize, 2)) MB to $([math]::Round($newSize, 2)) MB (saved $savedPct percent)" -ForegroundColor Green
                } else {
                    Remove-Item $tempPath
                    $savedPct = [math]::Round($percentSaved, 1)
                    Write-Host "  SKIPPED: Not enough savings ($savedPct percent)" -ForegroundColor Yellow
                }
            }
        }
        catch {
            Write-Host "  ERROR: $_" -ForegroundColor Red
            if (Test-Path $tempPath) {
                Remove-Item $tempPath
            }
        }
    }
    else {
        Write-Host "  WARNING: File not found: $file" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "Compression complete!" -ForegroundColor Green
