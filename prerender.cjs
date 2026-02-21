/**
 * Pre-render script for HondAanZee.be
 * Renders all routes to static HTML at build time for SEO.
 * Run after `vite build` to generate pre-rendered HTML files.
 */
const puppeteer = require('puppeteer');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('node:http');

const DIST_DIR = path.join(__dirname, 'dist');
const PORT = 4173;

// All routes to pre-render
const ROUTES = [
  '/',
  '/hotspots',
  '/diensten',
  '/losloopzones',
  '/kaart',
  '/over-ons',
  '/goed-om-te-weten',
  '/steun-ons',
  '/privacy',
  '/algemene-voorwaarden',
  '/cookies',
  // City pages
  '/blankenberge',
  '/zeebrugge',
  '/knokke-heist',
  '/de-haan',
  '/wenduine',
  '/bredene',
  '/oostende',
  '/middelkerke',
  '/nieuwpoort',
  '/koksijde',
  '/de-panne',
];

// Simple static file server for the dist folder
function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
      
      // SPA fallback: if file doesn't exist, serve index.html
      if (!fs.existsSync(filePath)) {
        filePath = path.join(DIST_DIR, 'index.html');
      }
      
      const ext = path.extname(filePath);
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.webp': 'image/webp',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.json': 'application/json',
      };
      
      try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    
    server.listen(PORT, () => {
      console.log(`  Static server on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function prerender() {
  console.log('Pre-rendering routes for SEO...\n');
  
  if (!fs.existsSync(DIST_DIR)) {
    console.error('Error: dist/ folder not found. Run `npm run build` first.');
    process.exit(1);
  }
  
  const server = await startServer();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  
  let rendered = 0;
  
  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();
      
      // Block unnecessary resources for faster rendering
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });
      
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 15000,
      });
      
      // Wait a bit for React to finish rendering
      await page.waitForSelector('#root > *', { timeout: 10000 });
      await new Promise(r => setTimeout(r, 500));
      
      const html = await page.content();
      
      // Post-process: fix elements that Puppeteer serializes incorrectly
      let processedHtml = html;
      
      // 1. Restore non-render-blocking font loading pattern.
      //    After JS execution, the preload→stylesheet onload hack fires,
      //    so Puppeteer serializes it as rel="stylesheet" which is render-blocking.
      //    Restore the async font loading pattern.
      processedHtml = processedHtml.replace(
        /<link\s+rel="stylesheet"\s+[^>]*href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"[^>]*>/gi,
        '<link rel="preload" as="style" href="$1" onload="this.onload=null;this.rel=\'stylesheet\'">\n<noscript><link rel="stylesheet" href="$1"></noscript>'
      );
      
      // 2. Restore viewport meta tag to correct values.
      //    Puppeteer may serialize a modified viewport on small viewports.
      processedHtml = processedHtml.replace(
        /<meta\s+name="viewport"\s+content="[^"]*">/gi,
        '<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, viewport-fit=cover">'
      );
      
      // 3. Restore hero-prerender if React moved/modified it.
      //    The homepage hero mounts the prerender div into the React hero section.
      //    Restore the original position in body for clean HTML output.
      if (route === '/') {
        // Remove any duplicated hero-prerender inside #root
        processedHtml = processedHtml.replace(
          /<div id="hero-prerender"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi,
          ''
        );
        // Re-insert clean prerender hero before #root
        const heroHtml = `<div id="hero-prerender" style="position:fixed;inset:0;z-index:0;background:#0f172a">` +
          `<img srcset="/lexi-mobile.webp 800w, /lexi.webp 1920w" sizes="100vw" src="/lexi.webp" alt="Hond aan het strand" style="width:100%;height:100%;object-fit:cover;object-position:center 30%" width="1920" height="1080" fetchpriority="high" loading="eager" decoding="sync">` +
          `<div style="position:absolute;inset:0;background:rgba(15,23,42,0.6)"></div>` +
          `</div>`;
        processedHtml = processedHtml.replace(
          /<div id="root"/,
          heroHtml + '\n    <div id="root"'
        );
      }
      
      // Determine output path
      const outputDir = route === '/' 
        ? DIST_DIR 
        : path.join(DIST_DIR, route);
      
      if (route !== '/') {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputFile = path.join(outputDir, 'index.html');
      fs.writeFileSync(outputFile, processedHtml);
      
      console.log(`  OK ${route}`);
      rendered++;
      
      await page.close();
    } catch (err) {
      console.error(`  FAIL ${route}: ${err.message}`);
    }
  }
  
  await browser.close();
  server.close();
  
  console.log(`\nDone! Pre-rendered ${rendered}/${ROUTES.length} routes.`);
}

prerender().catch(console.error);
