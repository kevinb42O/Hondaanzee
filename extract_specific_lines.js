const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'coast-map.svg');
const outputPath = path.join(__dirname, 'pages', 'CoastalPathsData.ts');

const lineMappings = {
    2: 'Blankenberge',
    3: 'Zeebrugge',
    4: 'Knokke-Heist',
    6: 'Bredene',
    8: 'Middelkerke',
    10: 'Oostende',
    12: 'De Haan',
    14: 'De Panne',
    16: 'Koksijde',
    18: 'Nieuwpoort'
};

try {
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    // Handle both CRLF and LF
    const lines = svgContent.split(/\r?\n/);

    let outputContent = 'export const COASTAL_PATHS: Record<string, string> = {\n';

    for (const [lineNumStr, city] of Object.entries(lineMappings)) {
        const lineNum = parseInt(lineNumStr);
        const index = lineNum - 1;

        if (index >= 0 && index < lines.length) {
            const line = lines[index];
            const match = line.match(/d="([^"]+)"/);
            if (match) {
                const pathData = match[1];
                outputContent += `  "${city}": "${pathData}",\n`;
                console.log(`Extracted path for ${city}`);
            } else {
                console.warn(`Warning: No d="..." found on line ${lineNum} for ${city}`);
            }
        } else {
            console.error(`Error: Line ${lineNum} is out of bounds (Total lines: ${lines.length})`);
        }
    }

    outputContent += '};\n';

    fs.writeFileSync(outputPath, outputContent);
    console.log(`Successfully generated ${outputPath}`);

} catch (err) {
    console.error('An error occurred:', err);
    process.exit(1);
}
