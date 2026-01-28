const fs = require('fs');

try {
    const svg = fs.readFileSync('public/coast-map.svg', 'utf8');
    const pathRegex = /<path[^>]*d=\"([^\"]*)\"/g;
    let match;
    const allPaths = [];

    // Parse all paths
    while ((match = pathRegex.exec(svg)) !== null) {
        const d = match[1];

        // Approximate BBox
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        const coords = d.match(/[\d\.]+/g); // Rough grab of all numbers
        if (!coords || coords.length < 4) continue;

        for (let i = 0; i < coords.length; i += 2) {
            const x = parseFloat(coords[i]);
            const y = parseFloat(coords[i + 1]);
            // Filter crazy values or relative moves
            if (!isNaN(x)) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
            }
            if (!isNaN(y)) {
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }

        const width = maxX - minX;
        const height = maxY - minY;
        const area = width * height;
        const centerX = minX + width / 2;

        // Sanity check
        if (area > 100) { // Filter tiny dots
            allPaths.push({ d, area, centerX, minX });
        }
    }

    // Sort by Area Descending (Biggest first)
    allPaths.sort((a, b) => b.area - a.area);

    // Take top 10
    const top10 = allPaths.slice(0, 10);

    // Sort Top 10 by CenterX (West to East)
    top10.sort((a, b) => a.centerX - b.centerX);

    // Output
    const result = top10.map(p => p.d);
    fs.writeFileSync('public/coast-paths.json', JSON.stringify(result, null, 2));
    console.log(`Extracted ${result.length} paths to public/coast-paths.json`);

} catch (err) {
    console.error(err);
}
