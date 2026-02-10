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
      
      // Determine output path
      const outputDir = route === '/' 
        ? DIST_DIR 
        : path.join(DIST_DIR, route);
      
      if (route !== '/') {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputFile = path.join(outputDir, 'index.html');
      fs.writeFileSync(outputFile, html);
      
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
