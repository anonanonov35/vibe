import { mkdir, writeFile } from 'node:fs/promises';
const assets = [
  ['hero.webp', 'photo-1565058379802-bbe93b2f703a', 1920],
];
await mkdir('public/images', { recursive: true });
for (const [name, id, width] of assets) {
  try {
    const response = await fetch(`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85&fm=webp`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await writeFile(`public/images/${name}`, Buffer.from(await response.arrayBuffer()));
    console.log(`${name}: downloaded`);
  } catch (error) { console.error(`${name}: ${error.message}`); }
}
