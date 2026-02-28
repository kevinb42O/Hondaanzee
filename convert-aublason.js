import sharp from 'sharp';

sharp('public/aublason2.jpg')
  .webp({ quality: 80 })
  .toFile('public/aublason2.webp')
  .then(() => {
    console.log('✓ Successfully converted aublason2.jpg to aublason2.webp');
  })
  .catch(err => {
    console.error('Error converting image:', err);
  });
