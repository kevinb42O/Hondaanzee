import sharp from 'sharp';
import fs from 'fs';

async function convertEloise() {
    try {
        await sharp('public/eloise.jpg')
            .webp({ quality: 85 })
            .toFile('public/eloise.webp');

        console.log('✅ Converted: public/eloise.jpg → public/eloise.webp');

        // Delete the original file
        fs.unlinkSync('public/eloise.jpg');
        console.log('🗑️  Deleted: public/eloise.jpg');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

convertEloise();
