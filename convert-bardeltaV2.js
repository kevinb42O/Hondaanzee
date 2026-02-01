import sharp from 'sharp';
import fs from 'fs';

async function convertBardeltaV2() {
    try {
        await sharp('public/bardeltaV2.jpg')
            .webp({ quality: 85 })
            .toFile('public/bardeltaV2.webp');

        console.log('✅ Converted: public/bardeltaV2.jpg → public/bardeltaV2.webp');

        // Delete the original file
        fs.unlinkSync('public/bardeltaV2.jpg');
        console.log('🗑️  Deleted: public/bardeltaV2.jpg');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

convertBardeltaV2();
