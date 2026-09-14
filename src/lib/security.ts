import { createHash, timingSafeEqual } from "node:crypto";

const attempts = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit = 5, window = 600_000) {
  const now = Date.now();
  if (attempts.size > 5000) for (const [k, entry] of attempts) if (entry.reset < now) attempts.delete(k);
  const entry = attempts.get(key);
  if (!entry || entry.reset < now) { attempts.set(key, { count: 1, reset: now + window }); return true; }
  entry.count++;
  return entry.count <= limit;
}
export function clientKey(request: Request) {
  return process.env.TRUST_PROXY === "true" ? request.headers.get("x-real-ip") || "unknown" : "shared";
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  return origin === new URL(allowed).origin;
}
export function isAdmin(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 24) return false;
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
  return timingSafeEqual(createHash("sha256").update(token).digest(), createHash("sha256").update(password).digest());
}
