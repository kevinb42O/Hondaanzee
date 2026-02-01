import fs from 'fs';

const filePath = 'constants.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of type: 'Hotel' with type: 'Slapen'
content = content.replace(/type: 'Hotel'/g, "type: 'Slapen'");

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Updated all Hotel types to Slapen in constants.ts');
