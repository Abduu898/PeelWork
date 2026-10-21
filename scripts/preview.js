// Local frontend preview only. The existing database/API server stays separate.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const pages = new Set(['index.html', 'job-detail.html', 'login.html', 'admin.html']);

http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const file = path.resolve(root, relative);
    const extension = path.extname(file);
    const publicAsset = (/^(css|js)\//.test(relative) && ['.js', '.css'].includes(extension))
      || (/^assets\//.test(relative) && extension === '.png');
    if (!file.startsWith(root + path.sep) || (!pages.has(relative) && !publicAsset)) {
      res.writeHead(404).end('Not found'); return;
    }
    const body = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': `${types[extension]}; charset=utf-8`, 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(Number(process.env.FRONTEND_PORT || 5173), '127.0.0.1', () => {
  console.log(`Frontend preview: http://localhost:${process.env.FRONTEND_PORT || 5173}`);
});
