import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagesToConvert = [
    { input: 'public/grandcafe.png', output: 'public/grandcafe.webp' },
    { input: 'public/fonduetketeltje.jpg', output: 'public/fonduetketeltje.webp' },
    { input: 'public/frituursparklechips.jpg', output: 'public/frituursparklechips.webp' },
    { input: 'public/taste.jpeg', output: 'public/taste.webp' },
    { input: 'public/majutte.jpg', output: 'public/majutte.webp' },
    { input: 'public/koffiepotje.jpg', output: 'public/koffiepotje.webp' },
    { input: 'public/myhomemycoffee.jpg', output: 'public/myhomemycoffee.webp' },
    { input: 'public/chezbanus.jpg', output: 'public/chezbanus.webp' },
    { input: 'public/LD383277.jpg', output: 'public/LD383277.webp' }
];

async function convertImages() {
    for (const { input, output } of imagesToConvert) {
        try {
            if (!fs.existsSync(input)) {
                console.log(`⚠️  Skipping ${input} - file not found`);
                continue;
            }

            await sharp(input)
                .webp({ quality: 85 })
                .toFile(output);

            console.log(`✅ Converted: ${input} → ${output}`);

            // Delete the original file
            fs.unlinkSync(input);
            console.log(`🗑️  Deleted: ${input}`);
        } catch (error) {
            console.error(`❌ Error converting ${input}:`, error.message);
        }
    }

    console.log('\n✨ Conversion complete!');
}

convertImages();
