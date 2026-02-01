import sharp from 'sharp';
import fs from 'fs';

async function convertImages() {
    const images = [
        { input: 'public/hippo12.jpg', output: 'public/hippo12.webp' },
        { input: 'public/bardelta.jpg', output: 'public/bardelta.webp' }
    ];

    for (const { input, output } of images) {
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
