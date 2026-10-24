import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';

const root = join(import.meta.dirname, 'dist/angular/browser');
const port = Number(process.env.PORT ?? 3456);
const host = process.env.HOST ?? '127.0.0.1';
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

// Headers a <meta> CSP cannot express. A real host or CDN must send the same set, plus HSTS over HTTPS.
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "frame-ancestors 'none'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

function send(res, status, body, type = 'text/plain; charset=utf-8', extra = {}) {
  res.writeHead(status, { ...securityHeaders, 'Content-Type': type, ...extra });
  res.end(body);
}

async function resolveFile(pathname) {
  const file = normalize(join(root, pathname));
  if (file !== root && !file.startsWith(root + sep)) return null;
  try {
    if ((await stat(file)).isFile()) return file;
  } catch {
    // Unknown paths fall through to the SPA shell or a 404 below.
  }
  return extname(pathname) ? null : join(root, 'index.html');
}

createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(res, 405, 'Method Not Allowed', undefined, { Allow: 'GET, HEAD' });
    }
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    } catch {
      return send(res, 400, 'Bad Request');
    }
    const file = await resolveFile(pathname);
    if (!file) return send(res, 404, 'Not Found');

    const ext = extname(file);
    const body = await readFile(file);
    send(res, 200, req.method === 'HEAD' ? undefined : body, types[ext] ?? 'application/octet-stream', {
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
  } catch {
    if (!res.headersSent) send(res, 500, 'Internal Server Error');
    else res.end();
  }
}).listen(port, host, () => console.log(`Genial Solutions em http://${host}:${port}`));
