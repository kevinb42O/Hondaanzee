const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const failures = [];
function check(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { check(file); continue; }
    if (!/\.(?:tsx?|jsx?|css)$/.test(entry.name)) continue;
    const source = fs.readFileSync(file, 'utf8');
    const imports = [...source.matchAll(/import\s+([\s\S]*?)\s+from\s+['"]lucide-react(?:\/[^'"]*)?['"]/g)];
    const forbiddenImport = imports.some(match => /\b\w*Sparkle\w*\b/i.test(match[1]));
    if (forbiddenImport || /<\w*Sparkle\w*\b|lucide-sparkles?\b|✨|✧|✦|🌟|hotspot-review-spark\b/.test(source)) {
      failures.push(path.relative(root, file));
    }
  }
}
for (const directory of ['components', 'pages']) check(path.join(root, directory));
if (failures.length) {
  console.error(`Sparkle-iconen zijn niet toegestaan (zie AGENTS.md):\n${failures.join('\n')}`);
  process.exit(1);
}
console.log('Designcontrole geslaagd: geen spark- of sparkle-iconen in de interface.');
