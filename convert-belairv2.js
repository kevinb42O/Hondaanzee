import sharp from 'sharp';
import fs from 'fs';

async function convertBelairV2() {
    try {
        await sharp('public/belairv2.jpg')
            .webp({ quality: 85 })
            .toFile('public/belairv2.webp');

        console.log('✅ Converted: public/belairv2.jpg → public/belairv2.webp');

        // Delete the original file
        fs.unlinkSync('public/belairv2.jpg');
        console.log('🗑️  Deleted: public/belairv2.jpg');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

convertBelairV2();
