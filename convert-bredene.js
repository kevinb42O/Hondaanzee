import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imageFiles = [
    { input: 'public/shopnlunch.jpeg', output: 'public/shopnlunch.webp' },
    { input: 'public/coffeee&winedegolf.jpg', output: 'public/coffeewinedegolf.webp' },
    { input: 'public/Alaska.jpg', output: 'public/alaska.webp' },
    { input: 'public/Q-ties.jpg', output: 'public/q-ties.webp' }
];

console.log('Converting Bredene business images to WebP...\n');

async function convertImages() {
    for (const file of imageFiles) {
        const input = path.join(__dirname, file.input);
        const output = path.join(__dirname, file.output);

        if (fs.existsSync(input)) {
            try {
                await sharp(input)
                    .webp({ quality: 80 })
                    .toFile(output);

                console.log(`✓ Converted: ${file.input} → ${file.output}`);

                // Delete the original file
                fs.unlinkSync(input);
                console.log(`  Deleted: ${file.input}`);
            } catch (error) {
                console.log(`✗ Failed to convert: ${file.input} - ${error.message}`);
            }
        } else {
            console.log(`✗ File not found: ${file.input}`);
        }
    }

    console.log('\nConversion complete!');
}

convertImages().catch(console.error);
