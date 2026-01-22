import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jpegFiles = [
  'wenduine.jpg',
  'oostende.jpg',
  'oostduinkerke.jpg',
  'nieuwpoort.jpg',
  'middelkerke.jpg',
  'knokke-heist.jpg',
  'depanne.jpg',
  'bredene.jpg',
  'blankenberge.jpg'
];

console.log('Converting JPEG files to WebP...\n');

async function convertImages() {
  for (const file of jpegFiles) {
    const input = path.join(__dirname, file);
    const output = path.join(__dirname, file.replace('.jpg', '.webp'));
    
    if (fs.existsSync(input)) {
      try {
        await sharp(input)
          .webp({ quality: 80 })
          .toFile(output);
        
        console.log(`✓ Converted: ${file} → ${file.replace('.jpg', '.webp')}`);
        
        // Delete the original JPEG file
        fs.unlinkSync(input);
        console.log(`  Deleted: ${file}`);
      } catch (error) {
        console.log(`✗ Failed to convert: ${file} - ${error.message}`);
      }
    } else {
      console.log(`✗ File not found: ${file}`);
    }
  }
  
  console.log('\nConversion complete!');
}

convertImages().catch(console.error);
