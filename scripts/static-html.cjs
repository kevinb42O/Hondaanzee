const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

function buildStaticHtml(shell, body, seo) {
  const image = seo.ogImage || 'https://hondaanzee.be/og-imagefinal.webp';
  const meta = (name, value, property = false) => `<meta ${property ? 'property' : 'name'}="${name}" content="${escapeHtml(value)}">`;
  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    meta('title', seo.title), meta('description', seo.description), meta('keywords', seo.keywords || ''),
    meta('robots', seo.noindex ? 'noindex, follow' : 'index, follow, max-snippet:-1, max-image-preview:large'),
    `<link rel="canonical" href="${escapeHtml(seo.canonical)}">`,
    `<link rel="alternate" hreflang="nl-BE" href="${escapeHtml(seo.canonical)}">`,
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(seo.canonical)}">`,
    meta('og:title', seo.title, true), meta('og:description', seo.description, true),
    meta('og:url', seo.canonical, true), meta('og:type', 'website', true),
    meta('og:image', image, true), meta('og:image:alt', seo.ogImageAlt || seo.title, true),
    meta('og:site_name', 'HondAanZee.be', true), meta('og:locale', 'nl_BE', true),
    meta('twitter:card', 'summary_large_image'), meta('twitter:site', '@hondaanzee'),
    meta('twitter:title', seo.title), meta('twitter:description', seo.description),
    meta('twitter:url', seo.canonical), meta('twitter:image', image), meta('twitter:image:alt', seo.ogImageAlt || seo.title),
    seo.structuredData ? `<script type="application/ld+json" data-dynamic="true">${JSON.stringify(seo.structuredData).replace(/</g, '\\u003c')}</script>` : '',
  ].join('\n');
  // Keep assets and the global organization schema; replace homepage metadata.
  return shell
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*(?:name="(?:title|description|keywords|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/gi, '')
    .replace(/<link\b[^>]*rel="(?:canonical|alternate)"[^>]*>/gi, '')
    // A business page must not preload the homepage hero instead of its own image.
    .replace(/<link\b[^>]*rel="preload"[^>]*as="image"[^>]*href="\/lexi(?:-mobile)?\.webp"[^>]*>/gi, '')
    .replace(/<div id="hero-prerender"[^>]*>[\s\S]*?<\/div>/, '')
    .replace('</head>', `${tags}\n</head>`)
    .replace(/(<div id="root"[^>]*>)<\/div>/, (_, opening) => `${opening}${body}</div>`);
}

module.exports = { buildStaticHtml, escapeHtml };
