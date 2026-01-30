Add-Type -AssemblyName System.Drawing

$imagesToConvert = @(
    @{ Input = "public\mercurehotel.jpg"; Output = "public\mercurehotel.webp" },
    @{ Input = "public\Hotel Pacific.jpg"; Output = "public\hotelpacific.webp" },
    @{ Input = "public\Hotel Royal Astrid.jpeg"; Output = "public\hotelroyalastrid.webp" },
    @{ Input = "public\Hotel Albert II.jpeg"; Output = "public\hotelalbert2.webp" },
    @{ Input = "public\Charmehotel 't Kruishof.jpg"; Output = "public\charmehotelkruishof.webp" },
    @{ Input = "public\B&B Huyze Elimonica.jpg"; Output = "public\huyzeelimonica.webp" },
    @{ Input = "public\Villa Cecha B&B & Wellness.jpg"; Output = "public\villacecha.webp" },
    @{ Input = "public\Maison Martha.jpeg"; Output = "public\maisonmartha.webp" },
    @{ Input = "public\Sea Breeze.jpeg"; Output = "public\seabreeze.webp" },
    @{ Input = "public\Zilte Stilte.jpg"; Output = "public\ziltestilte.webp" },
    @{ Input = "public\Les Cabanes d'Ostende.jpg"; Output = "public\lescabanes.webp" }
)

Write-Host "Converting images to WebP format..." -ForegroundColor Cyan
Write-Host ""

foreach ($image in $imagesToConvert) {
    $inputPath = $image.Input
    $outputPath = $image.Output
    
    if (Test-Path $inputPath) {
        try {
            # For now, just copy with .webp extension
            # Note: This doesn't actually convert to WebP, just renames
            # You'll need a proper WebP encoder
            Copy-Item $inputPath $outputPath -Force
            Write-Host "✓ Copied: $inputPath -> $outputPath" -ForegroundColor Green
        }
        catch {
            Write-Host "✗ Error processing $inputPath : $_" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠ Skipping $inputPath - file not found" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Note: Files were copied but not converted to WebP format." -ForegroundColor Yellow
Write-Host "Please use an online converter or install ImageMagick/cwebp for proper conversion." -ForegroundColor Yellow
