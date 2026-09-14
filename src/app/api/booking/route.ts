import { bookingSchema } from "@/lib/validation";
import { clientKey, rateLimit, sameOrigin } from "@/lib/security";
import { masters } from "@/lib/content";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Недопустимый источник запроса" }, { status: 403 });
  if (!rateLimit(`booking:${clientKey(request)}`)) return Response.json({ error: "Слишком много попыток. Попробуй через 10 минут." }, { status: 429 });
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 12_000) return Response.json({ error: "Слишком большая заявка" }, { status: 413 });
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return Response.json({ error: "Некорректные данные" }, { status: 400 }); }
  const result = bookingSchema.safeParse(input);
  if (!result.success) return Response.json({ error: "Проверь заполнение формы", fields: result.error.flatten().fieldErrors }, { status: 400 });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return Response.json({ error: "Онлайн-запись пока не подключена. Заявка не отправлена — попробуй позже." }, { status: 503 });
  const { name, method, contact, master, idea } = result.data;
  const text = ["Новая заявка · ВАЙБ", `Имя: ${name}`, `Связь: ${method === "telegram" ? "Telegram" : "Телефон"}`, `Контакт: ${contact}`, `Мастер: ${masters.find(m => m.id === master)?.name || "Помогите выбрать"}`, `Идея: ${idea || "Обсудим на консультации"}`, "Согласие на обработку данных: получено", `Время: ${new Date().toISOString()}`].join("\n");
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text }), signal: AbortSignal.timeout(10_000) });
    const body = await response.json();
    if (!response.ok || !body.ok) throw new Error("Telegram delivery failed");
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Не удалось подтвердить отправку. Попробуй чуть позже; при повторной заявке укажи это в комментарии." }, { status: 502 });
  }
}
