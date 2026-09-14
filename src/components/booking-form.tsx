"use client";
import { useRef, useState } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { bookingSchema } from "@/lib/validation";
import { masters } from "@/lib/content";
import Link from "next/link";
import { isDemo } from "@/lib/deployment";

export function BookingForm() {
  const [method, setMethod] = useState("telegram");
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [message, setMessage] = useState("");
  const summary = useRef<HTMLParagraphElement>(null);
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setMessage(""); setErrors({});
    const form = new FormData(event.currentTarget);
    const input = { name: form.get("name"), contact: form.get("contact"), idea: form.get("idea"), master: form.get("master"), method, consent: form.get("consent") === "on", website: form.get("website") };
    const result = bookingSchema.safeParse(input);
    if (!result.success) { setErrors(result.error.flatten().fieldErrors); setMessage("Проверь отмеченные поля."); requestAnimationFrame(() => summary.current?.focus()); return; }
    if (isDemo) { setStatus("success"); return; }
    setStatus("loading");
    try {
      const response = await fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(result.data) });
      const data = await response.json();
      if (!response.ok) { setMessage(data.error || "Не удалось отправить заявку."); setErrors(data.fields || {}); setStatus("idle"); requestAnimationFrame(() => summary.current?.focus()); return; }
      setStatus("success");
    } catch { setMessage("Нет соединения. Проверь интернет и попробуй снова — поля сохранены."); setStatus("idle"); }
  }
  if (status === "success") return <div className="form-success" role="status"><span className="success-icon"><Check size={32}/></span><h3>{isDemo ? "Вот так это работает." : "Начало положено."}</h3><p>{isDemo ? "Форма успешно прошла проверку. Это демонстрация для портфолио: заявка не отправлена, введённые данные не сохраняются." : "Заявка доставлена в студию. Мы свяжемся с тобой выбранным способом, чтобы обсудить идею и подобрать время."}</p><button className="text-link" onClick={() => { setStatus("idle"); setMessage(""); }}>{isDemo ? "Попробовать ещё раз" : "Отправить ещё одну заявку"} <ArrowUpRight size={18}/></button></div>;
  const error = (name: string) => errors[name] ? <span className="field-error" id={`${name}-error`}>{errors[name]?.[0]}</span> : null;
  return <form className="booking-form" noValidate onSubmit={submit}>
    {isDemo && <p className="demo-note">Демо для портфолио. Попробуй форму с вымышленными данными.</p>}
    <div className="form-row"><label className="field">Как тебя зовут<input name="name" placeholder="Твоё имя" autoComplete="given-name" maxLength={60} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined}/>{error("name")}</label><label className="field">К кому хочешь записаться<select name="master" defaultValue="any"><option value="any">Помогите выбрать мастера</option>{masters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label></div>
    <fieldset className="contact-choice"><legend>Где удобнее общаться?</legend><div>{[["telegram", "Telegram"], ["phone", "По телефону"]].map(([value, label]) => <label key={value} className={method === value ? "method selected" : "method"}><input type="radio" name="method" value={value} checked={method === value} onChange={() => { setMethod(value); setErrors(prev => ({ ...prev, contact: undefined })); }}/>{label}{method === value && <Check size={15}/>}</label>)}</div></fieldset>
    <label className="field">{method === "telegram" ? "Твой Telegram" : "Номер телефона"}<input name="contact" type={method === "phone" ? "tel" : "text"} placeholder={method === "telegram" ? "@your_name" : "+7 (999) 000-00-00"} autoComplete={method === "phone" ? "tel" : "off"} maxLength={80} aria-invalid={!!errors.contact} aria-describedby={errors.contact ? "contact-error" : undefined}/>{error("contact")}</label>
    <label className="field">Расскажи о своей идее <span className="optional">/ необязательно</span><textarea name="idea" placeholder="Стиль, размер, место. Или просто то, что тебя вдохновляет." rows={3} maxLength={1500} aria-describedby={errors.idea ? "idea-error" : undefined}/>{error("idea")}</label>
    <div className="honeypot" aria-hidden="true"><label>Сайт<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <label className="consent"><input name="consent" type="checkbox" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "consent-error" : undefined}/><span>{isDemo ? <>Я ознакомился с <Link href="/privacy" target="_blank" rel="noopener">описанием демоформы</Link> и понимаю, что заявка не отправляется.</> : <>Я согласен с <Link href="/privacy" target="_blank" rel="noopener">обработкой персональных данных</Link> для связи по моей заявке.</>}</span></label>{error("consent")}
    {message && <p className="form-message" role="alert" ref={summary} tabIndex={-1}>{message}</p>}
    <button className="button submit-button" type="submit" disabled={status === "loading"}>{status === "loading" ? <>Отправляем <LoaderCircle className="spinner" size={20}/></> : <>Давай создадим твою тату <ArrowUpRight size={22}/></>}</button>
    <p className="form-footnote">{isDemo ? "Демо для портфолио. Данные никуда не отправляются — можно указать вымышленные." : "Без обязательств. Сначала познакомимся и обсудим идею."}</p>
  </form>;
}
