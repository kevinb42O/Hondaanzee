import sharp from 'sharp';
import fs from 'fs';

async function convertTasteV2() {
    try {
        await sharp('public/tasteV2.jpg')
            .webp({ quality: 85 })
            .toFile('public/tasteV2.webp');

        console.log('✅ Converted: public/tasteV2.jpg → public/tasteV2.webp');

        // Delete the original file
        fs.unlinkSync('public/tasteV2.jpg');
        console.log('🗑️  Deleted: public/tasteV2.jpg');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

convertTasteV2();
