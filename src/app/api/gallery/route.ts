import { randomUUID } from "node:crypto";
import { writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { galleryDir, getGallery, type GalleryItem } from "@/lib/gallery";
import { clientKey, isAdmin, rateLimit, sameOrigin } from "@/lib/security";
import { categories, masters } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() { return Response.json(await getGallery()); }

function authorize(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Недопустимый источник" }, { status: 403 });
  if (!rateLimit(`admin:${clientKey(request)}`, 40)) return Response.json({ error: "Слишком много попыток. Подожди 10 минут." }, { status: 429 });
  if (!isAdmin(request)) return Response.json({ error: "Неверный пароль или доступ ещё не настроен" }, { status: 401 });
}

export async function POST(request: Request) {
  const rejected = authorize(request); if (rejected) return rejected;
  const length = Number(request.headers.get("content-length"));
  if (!length || length > 9 * 1024 * 1024) return Response.json({ error: "Файл должен быть не больше 8 МБ" }, { status: 413 });
  try {
    const data = await request.formData();
    const file = data.get("file");
    const title = String(data.get("title") || "").trim();
    const category = String(data.get("category") || "Графика");
    const kind = data.get("kind") === "master" ? "master" : "work";
    const master = String(data.get("master") || "");
    if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024 || file.size === 0) return Response.json({ error: "Выбери JPEG, PNG или WebP до 8 МБ" }, { status: 400 });
    if (!title || title.length > 100 || !categories.slice(1).includes(category) || (kind === "master" && !masters.some(m => m.id === master))) return Response.json({ error: "Проверь название, стиль и мастера" }, { status: 400 });
    const current = await getGallery();
    if (current.length >= 150) return Response.json({ error: "Лимит 150 изображений. Удали ненужные работы." }, { status: 400 });
    const buffer = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000, animated: false }).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
    const item: GalleryItem = { id: randomUUID(), title, category, kind, ...(kind === "master" ? { master } : {}), createdAt: new Date().toISOString() };
    await writeFile(path.join(galleryDir(), `${item.id}.webp`), buffer);
    await writeFile(path.join(galleryDir(), `${item.id}.json`), JSON.stringify(item));
    return Response.json(item, { status: 201 });
  } catch { return Response.json({ error: "Не удалось обработать изображение. Проверь файл и попробуй снова." }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  const rejected = authorize(request); if (rejected) return rejected;
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^[a-f0-9-]{36}$/.test(id)) return Response.json({ error: "Некорректный идентификатор" }, { status: 400 });
  try {
    await unlink(path.join(galleryDir(), `${id}.json`));
    await unlink(path.join(galleryDir(), `${id}.webp`));
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "Изображение не найдено или не удалось удалить" }, { status: 404 }); }
}
