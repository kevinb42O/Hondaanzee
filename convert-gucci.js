import sharp from 'sharp';

sharp('public/gucci_topper.jpeg')
  .webp({ quality: 80 })
  .toFile('public/gucci_topper.webp')
  .then(() => {
    console.log('✓ Successfully converted gucci_topper.jpeg to gucci_topper.webp');
  })
  .catch(err => {
    console.error('Error converting image:', err);
  });
