import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const input = path.join(__dirname, 'public/snuffelsfinal.png');
const output = path.join(__dirname, 'public/snuffels.webp');

console.log('Converting snuffelsfinal.png to WebP...\n');

async function convertImage() {
    if (fs.existsSync(input)) {
        try {
            await sharp(input)
                .webp({ quality: 80 })
                .toFile(output);

            console.log(`✓ Converted: snuffelsfinal.png → snuffels.webp`);

            // Delete the original file
            fs.unlinkSync(input);
            console.log(`  Deleted: snuffelsfinal.png`);
        } catch (error) {
            console.log(`✗ Failed to convert: ${error.message}`);
        }
    } else {
        console.log(`✗ File not found: snuffelsfinal.png`);
    }

    console.log('\nConversion complete!');
}

convertImage().catch(console.error);
