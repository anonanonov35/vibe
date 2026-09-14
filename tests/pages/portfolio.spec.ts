import { test, expect } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

test("static export loads all images, scripts and fonts under the configured path", async ({ page, baseURL }) => {
  const failures: string[] = [];
  page.on("pageerror", error => failures.push(error.message));
  page.on("response", response => { if (response.status() >= 400 && response.url().startsWith("http://localhost:4173")) failures.push(`${response.status()} ${response.url()}`); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("h1")).toContainText("ТВОЯ КОЖА");
  for (const image of await page.locator("img").all()) await image.scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator("img").evaluateAll(images => images.every(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
  const basePath = new URL(baseURL!).pathname.replace(/\/$/, "");
  const refs = await page.locator('img, script[src], link[rel="stylesheet"], link[rel="icon"]').evaluateAll(elements => elements.map(el => el.getAttribute("src") || el.getAttribute("href")));
  for (const ref of refs) expect(ref).toMatch(new RegExp(`^${basePath}/`));
  expect(await page.locator("body").evaluate(el => getComputedStyle(el).fontFamily)).toContain("Oswald");
  expect(failures).toEqual([]);
});

test("demo form validates locally and never sends a request", async ({ page }) => {
  const sent: string[] = [];
  page.on("request", request => { if (!["GET", "HEAD"].includes(request.method()) || request.postData()) sent.push(request.url()); });
  await page.goto("./#booking");
  await expect(page.getByText("Демо для портфолио. Попробуй форму с вымышленными данными.")).toBeVisible();
  await page.getByRole("button", { name: "Давай создадим твою тату" }).click();
  await expect(page.getByText("Укажи имя: минимум 2 символа")).toBeVisible();
  await page.getByLabel("Как тебя зовут").fill("Демо");
  await page.getByLabel("Твой Telegram").fill("@demo_user");
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Давай создадим твою тату" }).click();
  await expect(page.locator(".form-success")).toContainText("заявка не отправлена");
  await page.getByRole("button", { name: "Попробовать ещё раз" }).click();
  await expect(page.getByLabel("Как тебя зовут")).toHaveValue("");
  expect(sent).toEqual([]);
});

test("gallery filtering and image lightbox work without media API", async ({ page }) => {
  const apiCalls: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.includes("/api/")) apiCalls.push(request.url()); });
  await page.goto("./#portfolio");
  const count = await page.locator(".work-card").count();
  expect(count).toBeGreaterThan(0);
  await page.locator(".work-card").first().click();
  await expect(page.locator("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Ботаника", exact: true }).click();
  await expect(page.getByRole("button", { name: "Ботаника", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Все работы" }).click();
  await expect(page.locator(".work-card")).toHaveCount(count);
  expect(apiCalls).toEqual([]);
});

test("mobile layout, navigation, direct privacy link and back link", async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");
  await page.getByRole("button", { name: "Открыть меню" }).click();
  await page.getByRole("navigation").getByRole("link", { name: "Мастера" }).click();
  await expect(page.getByRole("button", { name: "Открыть меню" })).toHaveAttribute("aria-expanded", "false");
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole("link", { name: "О демо и данных" }).click();
  await expect(page).toHaveURL(`${baseURL}privacy/`);
  await expect(page.locator("h1")).toContainText("Это демо");
  await page.reload();
  await expect(page.locator("h1")).toContainText("Это демо");
  await page.getByRole("link", { name: "Вернуться к демоформе" }).click();
  await expect(page).toHaveURL(`${baseURL}#booking`);
});

test("no backend or environment files are published; SEO resources are static", async ({ request, baseURL }) => {
  const output = await readdir("out");
  expect(output).not.toContain("api"); expect(output).not.toContain("admin");
  expect(output).not.toContain(".env.local"); expect(output).not.toContain("data");
  expect(output).toContain(".nojekyll");
  for (const file of ["robots.txt", "sitemap.xml", "og-image.png", "icon.svg", "apple-icon.png"]) expect((await request.get(`${baseURL}${file}`)).status(), file).toBe(200);
  expect((await request.get(`${baseURL}admin/`)).status()).toBe(404);
  expect((await request.post(`${baseURL}api/booking`, { data: {} })).status()).toBe(405);
  const html = await readFile(path.join("out", "index.html"), "utf8");
  const { siteUrl } = JSON.parse(await readFile("out/.pages-preview.json", "utf8"));
  if (siteUrl) {
    expect(html).toContain(`href="${siteUrl}/"`);
    expect(html).toContain(`${siteUrl}/og-image.png`);
    expect(await readFile("out/sitemap.xml", "utf8")).toContain(`${siteUrl}/`);
  }
});
