import { cp, lstat, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('..', import.meta.url)));
const staging = path.join(root, '.pages-build');
const output = path.join(root, 'out');
const rawBase = process.env.NEXT_PUBLIC_BASE_PATH || '';
if (rawBase && !/^\/[A-Za-z0-9._-]+$/.test(rawBase)) throw new Error('NEXT_PUBLIC_BASE_PATH must be empty or /repository-name');
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:4173${rawBase}`;
const url = new URL(siteUrl);
if (!['http:', 'https:'].includes(url.protocol) || url.pathname.replace(/\/$/, '') !== rawBase) {
  throw new Error('NEXT_PUBLIC_SITE_URL must contain the same path as NEXT_PUBLIC_BASE_PATH');
}

// Only these two generated directories may be replaced. Refuse symlinks/junctions.
async function cleanGenerated(target) {
  if (![staging, output].includes(target) || path.dirname(target) !== root) throw new Error('Unsafe output path');
  const stat = await lstat(target).catch(error => { if (error.code !== 'ENOENT') throw error; return null; });
  if (stat && (stat.isSymbolicLink() || await realpath(target) !== target)) throw new Error(`Refusing linked output: ${target}`);
  await rm(target, { recursive: true, force: true });
}

await cleanGenerated(staging);
await mkdir(staging);
const excluded = ['src/app/api', 'src/app/admin', 'src/components/admin-panel.tsx', 'src/lib/security.ts'].map(p => path.join(root, p));
for (const entry of ['src', 'public', 'package.json', 'package-lock.json', 'next.config.ts', 'next-env.d.ts', 'postcss.config.mjs', 'tsconfig.json']) {
  await cp(path.join(root, entry), path.join(staging, entry), { recursive: true, filter: source => !excluded.some(p => source === p || source.startsWith(`${p}${path.sep}`)) });
}
// The normal application stays intact; only its isolated Pages copy is static.
const page = path.join(staging, 'src/app/page.tsx');
const source = await readFile(page, 'utf8');
if (!source.includes('export const dynamic = "force-dynamic";')) throw new Error('Home route changed: update the Pages entry point');
await writeFile(page, source.replace('export const dynamic = "force-dynamic";', 'export const dynamic = "force-static";'));
await writeFile(path.join(staging, 'src/lib/gallery.ts'), `import snapshot from "@/content/gallery.json";\nexport type GalleryItem = { id: string; title: string; category: string; kind: "work" | "master"; master?: string; createdAt: string };\nexport async function getGallery(): Promise<GalleryItem[]> { return snapshot as GalleryItem[]; }\n`);
for (const metadataRoute of ['robots.ts', 'sitemap.ts']) {
  const target = path.join(staging, 'src/app', metadataRoute);
  await writeFile(target, `export const dynamic = "force-static";\n${await readFile(target, 'utf8')}`);
}
await writeFile(path.join(staging, 'public/.nojekyll'), '');
const environment = { ...process.env, PAGES_BUILD: 'true', NEXT_PUBLIC_DEMO_MODE: 'true', NEXT_PUBLIC_BASE_PATH: rawBase, NEXT_PUBLIC_SITE_URL: siteUrl, NEXT_TELEMETRY_DISABLED: '1' };
for (const key of ['ADMIN_PASSWORD', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'DATA_DIR']) delete environment[key];
const build = spawnSync(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'build'], { cwd: staging, env: environment, stdio: 'inherit' });
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status || 1);
await cleanGenerated(output);
await cp(path.join(staging, 'out'), output, { recursive: true });
await writeFile(path.join(output, '.pages-preview.json'), JSON.stringify({ basePath: rawBase, siteUrl }));
console.log(`\nGitHub Pages build ready: ${output}\nBase path: ${rawBase || '/'}\nPreview: npm run preview:pages`);
