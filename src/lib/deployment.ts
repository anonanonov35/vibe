/** Values are fixed at build time so GitHub project Pages work under /repository/. */
export const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const assetPath = (pathname: string) => `${basePath}${pathname}`;
export const mediaPath = (id: string) => assetPath(isDemo ? `/portfolio/${id}.webp` : `/api/media/${id}`);
