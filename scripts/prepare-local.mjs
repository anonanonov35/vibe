import { access, writeFile, mkdir } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import sharp from 'sharp';

await mkdir('public', { recursive: true });
const overlay = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop stop-color="#10100f" stop-opacity=".97"/><stop offset="1" stop-color="#10100f" stop-opacity=".5"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><g font-family="Arial, sans-serif"><text x="65" y="92" fill="#ff6b35" font-size="50" font-weight="bold">вайб ✳</text><text x="68" y="174" fill="#ddd8cb" font-size="16" letter-spacing="4">ТАТУ-СТУДИЯ / МОСКВА</text><text x="60" y="310" fill="#f3f0e8" font-size="98" font-weight="bold" letter-spacing="-5">ТВОЯ КОЖА.</text><text x="60" y="420" fill="#ff6b35" font-size="93" font-weight="bold" letter-spacing="-5">ТВОИ ПРАВИЛА.</text><text x="68" y="550" fill="#e9e6de" font-size="22">Истории, которые остаются с тобой.</text></g></svg>`;
await sharp('public/images/hero.webp').resize(1200,630,{fit:'cover'}).composite([{input:Buffer.from(overlay)}]).png().toFile('public/og-image.png');
await sharp('src/app/icon.svg').resize(180,180).png().toFile('src/app/apple-icon.png');
try { await access('.env.local'); }
catch { await writeFile('.env.local', `NEXT_PUBLIC_SITE_URL=http://localhost:3000\nADMIN_PASSWORD=${randomBytes(24).toString('base64url')}\nTELEGRAM_BOT_TOKEN=\nTELEGRAM_CHAT_ID=\nDATA_DIR=./data\nTRUST_PROXY=false\n`); }
console.log('OG image, Apple icon and local environment are ready. Credentials are stored in .env.local.');
