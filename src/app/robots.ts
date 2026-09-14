import type { MetadataRoute } from "next";
import { assetPath, siteUrl } from "@/lib/deployment";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: assetPath("/"), disallow: ["/admin", "/api/", "/privacy"].map(assetPath) }, sitemap: `${siteUrl}/sitemap.xml` }; }
