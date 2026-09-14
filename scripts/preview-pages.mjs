import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../out/', import.meta.url));
const { basePath } = JSON.parse(await readFile(path.join(root, '.pages-preview.json'), 'utf8'));
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml' };
createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
    const url = new URL(request.url, `http://localhost:${port}`);
    const pathname = decodeURIComponent(url.pathname);
    if (basePath && pathname === basePath) { response.writeHead(301, { Location: `${basePath}/` }).end(); return; }
    if (basePath && !pathname.startsWith(`${basePath}/`)) { response.writeHead(404).end('Not found'); return; }
    const relative = pathname.slice(basePath.length).replace(/^\/+/, '');
    let file = path.resolve(root, relative || 'index.html');
    if (!file.startsWith(root) || relative.startsWith('.')) { response.writeHead(404).end(); return; }
    const info = await stat(file).catch(() => null);
    if (info?.isDirectory()) {
      if (!pathname.endsWith('/')) { response.writeHead(301, { Location: `${pathname}/${url.search}` }).end(); return; }
      file = path.join(file, 'index.html');
    }
    let status = 200;
    const body = await readFile(file).catch(async () => { status = 404; file = path.join(root, '404.html'); return readFile(file); });
    response.writeHead(status, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(400).end('Bad request'); }
}).listen(port, '127.0.0.1', () => console.log(`Static Pages preview: http://localhost:${port}${basePath}/`));
