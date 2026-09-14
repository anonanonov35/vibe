import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingSchema } from "../src/lib/validation";
import { isAdmin, rateLimit, sameOrigin } from "../src/lib/security";

const valid = { name: "Анна", method: "telegram", contact: "@anna_tattoo", master: "any", idea: "Цветок", consent: true, website: "" };
test("accepts a valid Telegram request and trims values", () => { const result = bookingSchema.parse({ ...valid, name: "  Анна  " }); assert.equal(result.name, "Анна"); });
test("requires consent and rejects unknown master", () => { assert.equal(bookingSchema.safeParse({ ...valid, consent: false }).success, false); assert.equal(bookingSchema.safeParse({ ...valid, master: "unknown" }).success, false); });
test("validates each contact method", () => { assert.equal(bookingSchema.safeParse({ ...valid, contact: "wrong contact" }).success, false); assert.equal(bookingSchema.safeParse({ ...valid, method: "phone", contact: "+7 (999) 123-45-67" }).success, true); assert.equal(bookingSchema.safeParse({ ...valid, method: "phone", contact: "123" }).success, false); });
test("rejects spam and oversized comments", () => { assert.equal(bookingSchema.safeParse({ ...valid, website: "spam" }).success, false); assert.equal(bookingSchema.safeParse({ ...valid, idea: "a".repeat(1501) }).success, false); });
test("admin access fails closed when unconfigured or password is wrong", () => { const old = process.env.ADMIN_PASSWORD; try { delete process.env.ADMIN_PASSWORD; assert.equal(isAdmin(new Request("http://localhost")), false); process.env.ADMIN_PASSWORD = "test-password-at-least-24-characters"; assert.equal(isAdmin(new Request("http://localhost", { headers: { Authorization: "Bearer wrong" } })), false); assert.equal(isAdmin(new Request("http://localhost", { headers: { Authorization: `Bearer ${process.env.ADMIN_PASSWORD}` } })), true); } finally { if (old === undefined) delete process.env.ADMIN_PASSWORD; else process.env.ADMIN_PASSWORD = old; } });
test("checks origin and limits repeated requests", () => { assert.equal(sameOrigin(new Request("http://localhost", { headers: { origin: "https://attacker.example" } })), false); assert.equal(sameOrigin(new Request("http://localhost")), false); const key = `test-${Date.now()}`; assert.equal(rateLimit(key, 2), true); assert.equal(rateLimit(key, 2), true); assert.equal(rateLimit(key, 2), false); });
