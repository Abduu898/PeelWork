// Local frontend preview with API requests proxied to the integrated server.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const pages = new Set([
  'index.html',
  'job-detail.html',
  'login.html',
  'jobs.html',
  'admin.html',
  'candidate-dashboard.html',
  'super-admin.html',
]);
const apiPort = Number(process.env.API_PORT || 3000);

function proxyApiRequest(req, res) {
  const proxy = http.request({
    hostname: '127.0.0.1',
    port: apiPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${apiPort}` },
  }, (apiResponse) => {
    res.writeHead(apiResponse.statusCode || 502, apiResponse.headers);
    apiResponse.pipe(res);
  });

  proxy.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: `API server is not running. Start it with "npm start" on port ${apiPort}.` }));
    }
  });

  req.pipe(proxy);
}

http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const file = path.resolve(root, relative);
    const extension = path.extname(file);
    const publicAsset = (/^(css|js)\//.test(relative) && ['.js', '.css'].includes(extension))
      || (/^assets\//.test(relative) && extension === '.png');
    if (!file.startsWith(root + path.sep) || (!pages.has(relative) && !publicAsset)) {
      proxyApiRequest(req, res); return;
    }
    const body = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': `${types[extension]}; charset=utf-8`, 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    proxyApiRequest(req, res);
  }
}).listen(Number(process.env.FRONTEND_PORT || 5173), '127.0.0.1', () => {
  console.log(`Frontend preview: http://localhost:${process.env.FRONTEND_PORT || 5173}`);
  console.log(`API proxy target: http://127.0.0.1:${apiPort}`);
});
