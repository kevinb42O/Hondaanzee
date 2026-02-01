import sharp from 'sharp';
import fs from 'fs';

async function convertApartments() {
    const images = [
        { input: 'public/seasparkle.jpg', output: 'public/seasparkle.webp' },
        { input: 'public/pancho.jpg', output: 'public/pancho.webp' }
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

convertApartments();
