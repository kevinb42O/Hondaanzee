import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function convertToWebP(inputFile) {
    const outputFile = path.join(__dirname, 'public', path.basename(inputFile, path.extname(inputFile)) + '.webp');

    try {
        await sharp(inputFile)
            .webp({ quality: 85 })
            .toFile(outputFile);
        console.log(`✓ Converted ${inputFile} to ${outputFile}`);
    } catch (error) {
        console.error(`✗ Error converting ${inputFile}:`, error.message);
    }
}

// Convert both files
Promise.all([
    convertToWebP('belair.jpeg'),
    convertToWebP('beachpalace.jfif')
]).then(() => {
    console.log('All conversions complete!');
}).catch(err => {
    console.error('Error:', err);
});
