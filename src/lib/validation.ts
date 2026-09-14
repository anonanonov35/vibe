import { z } from "zod";

export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Укажи имя: минимум 2 символа").max(60, "Не больше 60 символов"),
  method: z.enum(["telegram", "phone"]),
  contact: z.string().trim().min(1, "Укажи контакт для связи").max(80),
  idea: z.string().trim().max(1500, "Не больше 1500 символов").default(""),
  master: z.enum(["any", "alex", "max", "anna"]).default("any"),
  consent: z.literal(true, { error: "Нужно согласие на обработку данных" }),
  website: z.string().max(0).optional(),
}).superRefine((value, ctx) => {
  if (value.method === "telegram" && !/^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(value.contact)) {
    ctx.addIssue({ code: "custom", path: ["contact"], message: "Введи Telegram username, например @your_name" });
  }
  if (value.method === "phone" && !/^\+?[\d\s()\-]+$/.test(value.contact)) {
    ctx.addIssue({ code: "custom", path: ["contact"], message: "Введи номер телефона с кодом страны" });
  } else if (value.method === "phone" && !/^\d{10,15}$/.test(value.contact.replace(/\D/g, ""))) {
    ctx.addIssue({ code: "custom", path: ["contact"], message: "Номер должен содержать от 10 до 15 цифр" });
  }
});

export type BookingInput = z.input<typeof bookingSchema>;
