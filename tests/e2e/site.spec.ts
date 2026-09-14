import { test, expect } from "@playwright/test";
import path from "node:path";

test("desktop navigation, gallery filters and keyboard lightbox", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/ВАЙБ/);
  await expect(page.locator("h1")).toHaveCount(1);
  await page.getByRole("button", { name: "Ботаника", exact: true }).click();
  await expect(page.locator(".work-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Рассмотреть: Ближе к природе" }).click();
  await expect(page.locator("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Все работы" }).click();
  await expect(page.locator(".work-card")).toHaveCount(4);
  await page.locator("summary").first().click();
  await expect(page.locator("details").first()).toHaveAttribute("open", "");
  await page.evaluate(() => document.fonts.ready);
  await page.locator("h1").click();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: "artifacts/desktop-first-screen.png" });
  await page.screenshot({ path: "artifacts/desktop.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("mobile menu, 375px and landscape do not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 }); await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "artifacts/mobile-first-screen.png" });
  await page.getByRole("button", { name: "Открыть меню" }).click();
  await expect(page.getByRole("navigation")).toBeVisible();
  await page.getByRole("navigation").getByRole("link", { name: "Мастера" }).click();
  await expect(page.getByRole("button", { name: "Открыть меню" })).toHaveAttribute("aria-expanded", "false");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "artifacts/mobile.png", fullPage: true });
  for (const width of [320, 768, 1024]) { await page.setViewportSize({ width, height: 700 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
  await page.setViewportSize({ width: 812, height: 375 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
});

test("booking validation and honest unavailable state retain entered data", async ({ page }) => {
  await page.goto("/#booking");
  await page.getByRole("button", { name: "Давай создадим твою тату" }).click();
  await expect(page.getByText("Укажи имя: минимум 2 символа")).toBeVisible();
  await page.getByLabel("Как тебя зовут").fill("Тестовый посетитель");
  await page.getByLabel("Твой Telegram").fill("@test_vibe");
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Давай создадим твою тату" }).click();
  await expect(page.locator(".form-message")).toContainText("Онлайн-запись пока не подключена");
  await expect(page.getByLabel("Как тебя зовут")).toHaveValue("Тестовый посетитель");
  await page.getByText("По телефону", { exact: true }).click();
  await expect(page.getByLabel("Номер телефона")).toHaveAttribute("type", "tel");
});

test("upload authentication, publishing, filtering and deletion", async ({ page, request }) => {
  const denied = await request.post("/api/gallery", { headers: { Origin: "http://localhost:3100", Authorization: "Bearer wrong" }, multipart: { title: "No access" } }); expect(denied.status()).toBe(401);
  await page.goto("/admin");
  await page.getByLabel("Пароль администратора").fill("e2e-password-not-for-production-123");
  await page.getByLabel("Название / описание изображения").fill("Тестовая работа");
  await page.getByRole("combobox", { name: "Стиль", exact: true }).selectOption("Графика");
  await page.getByLabel("Изображение", { exact: true }).setInputFiles(path.resolve("public/images/hero.webp"));
  await page.getByRole("button", { name: "Опубликовать", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Изображение опубликовано");
  const items = await (await request.get("/api/gallery")).json(); const id = items[0].id;
  try {
    const media = await request.get(`/api/media/${id}`); expect(media.status()).toBe(200); expect(media.headers()["content-type"]).toBe("image/webp");
    await page.goto("/"); await expect(page.getByRole("button", { name: "Рассмотреть: Тестовая работа" })).toBeVisible();
    await page.getByRole("button", { name: "Ботаника", exact: true }).click(); await expect(page.getByText("В этом стиле пока нет работ.", { exact: false })).toBeVisible();
  } finally {
    const removed = await request.delete(`/api/gallery?id=${id}`, { headers: { Origin: "http://localhost:3100", Authorization: "Bearer e2e-password-not-for-production-123" } }); expect(removed.status()).toBe(200);
  }
});

test("SEO resources and cross-origin protection", async ({ request }) => {
  for (const url of ["/robots.txt", "/sitemap.xml", "/icon.svg", "/apple-icon.png", "/og-image.png", "/privacy"]) expect((await request.get(url)).status(), url).toBe(200);
  expect((await request.get("/missing-page")).status()).toBe(404);
  const rejected = await request.post("/api/booking", { headers: { Origin: "https://attacker.example" }, data: {} }); expect(rejected.status()).toBe(403);
});
