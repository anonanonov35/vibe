import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";

export type GalleryItem = { id: string; title: string; category: string; kind: "work" | "master"; master?: string; createdAt: string };
export const dataDir = () => path.resolve(/* turbopackIgnore: true */ process.env.DATA_DIR || "./data");
export const galleryDir = () => path.join(dataDir(), "gallery");
export async function getGallery(): Promise<GalleryItem[]> {
  await mkdir(galleryDir(), { recursive: true });
  const files = await readdir(galleryDir());
  const entries = await Promise.all(files.filter(f => f.endsWith(".json")).map(async file => {
    try { return JSON.parse(await readFile(path.join(galleryDir(), file), "utf8")) as GalleryItem; }
    catch { return null; }
  }));
  return entries.filter((item): item is GalleryItem => item !== null).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
