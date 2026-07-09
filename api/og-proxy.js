import routes from '../og-routes.js';

export default function handler(req, res) {
  // Normalize the path from the query parameter
  let requestPath = '/' + (req.query.path || '');
  if (requestPath.endsWith('/') && requestPath !== '/') {
    requestPath = requestPath.slice(0, -1);
  }

  // Find the requested route, or default to the homepage data if not found
  const routeData = routes[requestPath] || routes['/'];

  return serveHtml(res, {
    ...routeData,
    url: `https://hondaanzee.be${requestPath}`
  });
}

function serveHtml(res, data) {
  const escapeHtml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const html = `<!DOCTYPE html>
<html lang="nl-BE">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(data.title)}</title>
  <meta name="title" content="${escapeHtml(data.title)}">
  <meta name="description" content="${escapeHtml(data.description)}">
  
  <meta property="og:title" content="${escapeHtml(data.title)}">
  <meta property="og:description" content="${escapeHtml(data.description)}">
  <meta property="og:image" content="${escapeHtml(data.image)}">
  <meta property="og:url" content="${escapeHtml(data.url)}">
  <meta property="og:type" content="${escapeHtml(data.type || 'website')}">
  <meta property="og:site_name" content="HondAanZee.be">
  <meta property="og:locale" content="nl_BE">
  ${data.imageAlt ? `<meta property="og:image:alt" content="${escapeHtml(data.imageAlt)}">` : ''}
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(data.title)}">
  <meta name="twitter:description" content="${escapeHtml(data.description)}">
  <meta name="twitter:image" content="${escapeHtml(data.image)}">
</head>
<body>
  <h1>${escapeHtml(data.title)}</h1>
  <p>${escapeHtml(data.description)}</p>
  <img src="${escapeHtml(data.image)}" alt="OG Image">
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Cache at edge for 24h, stale-while-revalidate for 1 hour
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
  res.status(200).send(html);
}
