import { test } from "node:test";
import assert from "node:assert/strict";
import { POST } from "../src/app/api/booking/route";

test("booking API validates, fails honestly, and confirms only Telegram delivery", async () => {
  const originalFetch = global.fetch;
  const old = { token: process.env.TELEGRAM_BOT_TOKEN, chat: process.env.TELEGRAM_CHAT_ID, origin: process.env.SITE_URL };
  process.env.SITE_URL = "https://studio.example";
  const input = { name: "Тест", method: "telegram", contact: "@test_user", master: "any", consent: true, idea: "Тестовая идея", website: "" };
  const request = (data: unknown) => new Request("https://studio.example/api/booking", { method: "POST", headers: { origin: "https://studio.example", "content-type": "application/json" }, body: JSON.stringify(data) });
  try {
    assert.equal((await POST(request({ ...input, consent: false }))).status, 400);
    delete process.env.TELEGRAM_BOT_TOKEN; delete process.env.TELEGRAM_CHAT_ID;
    assert.equal((await POST(request(input))).status, 503);
    process.env.TELEGRAM_BOT_TOKEN = "mock-token"; process.env.TELEGRAM_CHAT_ID = "mock-chat";
    global.fetch = async (_url, options) => { const payload = JSON.parse(String(options?.body)); assert.equal(payload.chat_id, "mock-chat"); assert.match(payload.text, /Тестовая идея/); assert.equal(payload.parse_mode, undefined); return Response.json({ ok: true }); };
    const delivered = await POST(request(input)); assert.equal(delivered.status, 200); assert.deepEqual(await delivered.json(), { ok: true });
    global.fetch = async () => Response.json({ ok: false }, { status: 400 });
    assert.equal((await POST(request(input))).status, 502);
    global.fetch = async () => { throw new Error("offline"); };
    assert.equal((await POST(request(input))).status, 502);
  } finally {
    global.fetch = originalFetch;
    for (const [key, value] of [["TELEGRAM_BOT_TOKEN", old.token], ["TELEGRAM_CHAT_ID", old.chat], ["SITE_URL", old.origin]]) { if (value === undefined) delete process.env[key!]; else process.env[key!] = value; }
  }
});
