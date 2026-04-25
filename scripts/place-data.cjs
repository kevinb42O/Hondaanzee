const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const ROOT_DIR = path.resolve(__dirname, '..');

const STATIC_ROUTES = [
  '/',
  '/hotspots',
  '/diensten',
  '/losloopzones',
  '/kaart',
  '/over-ons',
  '/goed-om-te-weten',
  '/steun-ons',
  '/zaak-aanmelden',
  '/privacy',
  '/algemene-voorwaarden',
  '/cookies',
  '/blog',
  '/agenda',
  '/community',
  '/meldpunt',
  '/meldpunt/vrijwilligers',
  '/updates',
];

const loadTsModule = (relativePath) => {
  const absolutePath = path.join(ROOT_DIR, relativePath);
  const source = fs.readFileSync(absolutePath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: absolutePath,
  });

  const module = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports,
    require: () => {
      throw new Error(`Unexpected runtime import while loading ${relativePath}`);
    },
    __dirname: path.dirname(absolutePath),
    __filename: absolutePath,
    console,
    process,
  };

  vm.runInNewContext(outputText, sandbox, { filename: absolutePath });
  return module.exports;
};

const { HOTSPOTS } = loadTsModule('data/hotspots.ts');
const { SERVICES } = loadTsModule('data/services.ts');
const { CITIES } = loadTsModule('cityData.ts');
const { blogPosts } = loadTsModule('data/blogs.ts');
const { OFF_LEASH_AREAS } = loadTsModule('data/offLeashAreas.ts');

const getPlaceRoutes = () => [
  ...HOTSPOTS.map((spot) => `/${spot.city}/hotspots/${spot.slug}`),
  ...SERVICES.map((service) => `/${service.city}/diensten/${service.slug}`),
];

const getOffLeashRoutes = () => OFF_LEASH_AREAS.map((area) => `/losloopzones/${area.slug}`);

const getAllRoutes = () => [
  ...STATIC_ROUTES,
  ...CITIES.map((city) => `/${city.slug}`),
  ...blogPosts.map((post) => `/blog/${post.slug}`),
  ...getPlaceRoutes(),
  ...getOffLeashRoutes(),
];

module.exports = {
  HOTSPOTS,
  SERVICES,
  CITIES,
  blogPosts,
  OFF_LEASH_AREAS,
  STATIC_ROUTES,
  getPlaceRoutes,
  getOffLeashRoutes,
  getAllRoutes,
};
