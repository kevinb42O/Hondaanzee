# Load System.Drawing assembly
Add-Type -AssemblyName System.Drawing

# Install WebP library if needed
if (!(Get-Module -ListAvailable -Name ImageProcessor)) {
    Write-Host "Installing ImageMagick via Chocolatey..."
}

# List of JPEG files to convert
$jpegFiles = @(
    'wenduine.jpg',
    'oostende.jpg',
    'oostduinkerke.jpg',
    'nieuwpoort.jpg',
    'middelkerke.jpg',
    'knokke-heist.jpg',
    'depanne.jpg',
    'bredene.jpg',
    'blankenberge.jpg'
)

Write-Host "Converting JPEG files to WebP...`n"

foreach ($file in $jpegFiles) {
    $inputPath = Join-Path $PSScriptRoot $file
    $outputPath = Join-Path $PSScriptRoot ($file -replace '\.jpg$', '.webp')
    
    if (Test-Path $inputPath) {
        try {
            # Use magick if available
            & magick convert "$inputPath" "$outputPath"
            Write-Host "✓ Converted: $file → $($file -replace '\.jpg$', '.webp')"
            
            # Delete the original JPEG file
            Remove-Item $inputPath
            Write-Host "  Deleted: $file"
        }
        catch {
            Write-Host "✗ Failed to convert: $file - $_"
        }
    }
    else {
        Write-Host "✗ File not found: $file"
    }
}

Write-Host "`nConversion complete!"
