import { readFile } from "node:fs/promises";
import path from "node:path";
import { galleryDir } from "@/lib/gallery";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 404 });
  try {
    const image = await readFile(path.join(galleryDir(), `${id}.webp`));
    return new Response(image, { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response(null, { status: 404 }); }
}
