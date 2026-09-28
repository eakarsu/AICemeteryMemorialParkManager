const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const buildDir = path.resolve(__dirname, 'build');
const port = Number(process.env.PORT || process.env.FRONTEND_PORT || 3000);
const backendPort = Number(process.env.BACKEND_PORT || 3001);
const contentTypes = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    const upstream = http.request({ hostname: '127.0.0.1', port: backendPort, path: req.url, method: req.method, headers: { ...req.headers, host: `127.0.0.1:${backendPort}` } }, (upstreamResponse) => {
      res.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers);
      upstreamResponse.pipe(res);
    });
    upstream.on('error', () => res.writeHead(502).end('Backend unavailable'));
    req.pipe(upstream);
    return;
  }

  let file = path.resolve(buildDir, pathname === '/' ? 'index.html' : pathname.slice(1));
  if (!file.startsWith(`${buildDir}${path.sep}`) && file !== path.join(buildDir, 'index.html')) return res.writeHead(403).end('Forbidden');
  if (!path.extname(file)) file = path.join(buildDir, 'index.html');
  fs.readFile(file, (error, body) => {
    if (error && error.code === 'ENOENT') return fs.readFile(path.join(buildDir, 'index.html'), (fallbackError, fallback) => fallbackError ? res.writeHead(404).end('Not found') : res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }).end(fallback));
    if (error) return res.writeHead(500).end('Server error');
    res.writeHead(200, { 'Content-Type': contentTypes[path.extname(file)] || 'application/octet-stream', 'Cache-Control': pathname === '/' ? 'no-store' : 'public, max-age=300' });
    res.end(body);
  });
}).listen(port, '127.0.0.1', () => console.log(`Cemetery UI listening on http://127.0.0.1:${port}`));
