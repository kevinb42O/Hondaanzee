const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesToConvert = [
    { input: 'public/mercurehotel.jpg', output: 'public/mercurehotel.webp' },
    { input: 'public/Hotel Pacific.jpg', output: 'public/hotelpacific.webp' },
    { input: 'public/Hotel Royal Astrid.jpeg', output: 'public/hotelroyalastrid.webp' },
    { input: 'public/Hotel Albert II.jpeg', output: 'public/hotelalbert2.webp' },
    { input: 'public/Charmehotel \'t Kruishof.jpg', output: 'public/charmehotelkruishof.webp' },
    { input: 'public/B&B Huyze Elimonica.jpg', output: 'public/huyzeelimonica.webp' },
    { input: 'public/Villa Cecha B&B & Wellness.jpg', output: 'public/villacecha.webp' },
    { input: 'public/Maison Martha.jpeg', output: 'public/maisonmartha.webp' },
    { input: 'public/Villa Odette.avif', output: 'public/villaodette.webp' },
    { input: 'public/Sea Breeze.jpeg', output: 'public/seabreeze.webp' },
    { input: 'public/Zilte Stilte.jpg', output: 'public/ziltestilte.webp' },
    { input: 'public/Les Cabanes d\'Ostende.jpg', output: 'public/lescabanes.webp' }
];

async function convertImages() {
    console.log('Starting image conversion to WebP...\n');

    for (const { input, output } of imagesToConvert) {
        try {
            if (!fs.existsSync(input)) {
                console.log(`⚠️  Skipping ${input} - file not found`);
                continue;
            }

            await sharp(input)
                .webp({ quality: 85 })
                .toFile(output);

            console.log(`✅ Converted: ${path.basename(input)} → ${path.basename(output)}`);
        } catch (error) {
            console.error(`❌ Error converting ${input}:`, error.message);
        }
    }

    console.log('\n✨ Conversion complete!');
}

convertImages();
