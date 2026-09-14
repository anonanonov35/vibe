import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
// Never read .env.local: only explicitly supplied DATA_DIR or the local data folder.
const source = path.resolve(process.env.DATA_DIR || path.join(root, 'data'), 'gallery');
const entries = await readdir(source).catch(error => { if (error.code === 'ENOENT') return []; throw error; });
if (!entries.some(file => file.endsWith('.json'))) {
  console.log('No local gallery items. Existing committed snapshot remains unchanged.');
  process.exit(0);
}
const items = [];
await mkdir(path.join(root, 'public/portfolio'), { recursive: true });
for (const file of entries.filter(name => name.endsWith('.json'))) {
  const item = JSON.parse(await readFile(path.join(source, file), 'utf8'));
  if (!/^[a-f0-9-]{36}$/.test(item.id) || `${item.id}.json` !== file || !['work', 'master'].includes(item.kind) || typeof item.title !== 'string' || typeof item.category !== 'string') throw new Error(`Invalid gallery entry: ${file}`);
  // Only public display fields enter the committed snapshot.
  items.push({ id: item.id, title: item.title, category: item.category, kind: item.kind, ...(item.master ? { master: item.master } : {}), createdAt: item.createdAt });
  await cp(path.join(source, `${item.id}.webp`), path.join(root, 'public/portfolio', `${item.id}.webp`));
}
items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
await writeFile(path.join(root, 'src/content/gallery.json'), `${JSON.stringify(items, null, 2)}\n`);
console.log(`Prepared ${items.length} public images. Commit src/content/gallery.json and public/portfolio/.`);
