"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, LoaderCircle, Upload } from "lucide-react";
import { categories, masters } from "@/lib/content";
import type { GalleryItem } from "@/lib/gallery";

export function AdminPanel({ initial }: { initial: GalleryItem[] }) {
  const [items, setItems] = useState(initial);
  const [password, setPassword] = useState("");
  const [kind, setKind] = useState("work");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  async function refresh() { const response = await fetch("/api/gallery", { cache: "no-store" }); if (response.ok) setItems(await response.json()); }
  async function upload(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!password) { setStatus("Введи пароль администратора."); return; }
    setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/gallery", { method: "POST", headers: { Authorization: `Bearer ${password}` }, body: new FormData(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ошибка загрузки");
      setStatus("Изображение опубликовано на сайте."); form.reset(); setKind("work"); await refresh();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Нет соединения. Попробуй снова."); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!password) { setStatus("Введи пароль администратора."); return; }
    setBusy(true);
    try {
      const response = await fetch(`/api/gallery?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${password}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStatus("Изображение удалено."); setConfirmId(null); await refresh();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Не удалось удалить изображение."); }
    finally { setBusy(false); }
  }
  return <>
    <div className="admin-panel"><label className="field">Пароль администратора<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" placeholder="Пароль из ADMIN_PASSWORD"/></label><p>Пароль хранится только в памяти открытой страницы. Доступ настраивается через ADMIN_PASSWORD на сервере.</p></div>
    <form className="admin-panel" onSubmit={upload}><h2>Добавить изображение</h2><p>JPEG, PNG или WebP до 8 МБ. Файл автоматически уменьшится и сохранится в WebP без метаданных.</p><div className="form-row"><label className="field">Куда добавить<select name="kind" value={kind} onChange={event => setKind(event.target.value)}><option value="work">Портфолио</option><option value="master">Фото мастера</option></select></label><label className="field">{kind === "work" ? "Стиль" : "Мастер"}{kind === "work" ? <select name="category">{categories.slice(1).map(c => <option key={c}>{c}</option>)}</select> : <select name="master">{masters.map(m => <option value={m.id} key={m.id}>{m.name}</option>)}</select>}</label></div><label className="field">Название / описание изображения<input name="title" required maxLength={100} placeholder={kind === "work" ? "Например: Пион на предплечье" : "Например: Анна за работой"}/></label><label className="field">Изображение<input name="file" type="file" accept="image/jpeg,image/png,image/webp" required/></label><button className="button" disabled={busy} type="submit">{busy ? <>Обрабатываем <LoaderCircle className="spinner" size={18}/></> : <>Опубликовать <Upload size={18}/></>}</button></form>
    {status && <p className="admin-status" role="status">{status}</p>}
    <h2>Опубликованные изображения · {items.length}</h2><p>Для мастера показывается последняя загруженная фотография. Портфолио обновляется сразу. Максимум 150 изображений.</p>
    {items.length ? <div className="admin-grid">{items.map(item => <article className="admin-item" key={item.id}><div className="admin-image"><Image src={`/api/media/${item.id}`} alt={item.title} fill sizes="(max-width: 600px) 50vw, 33vw"/></div><h3>{item.title}</h3><p>{item.kind === "master" ? `Мастер: ${masters.find(m => m.id === item.master)?.name}` : item.category}</p><div className="admin-actions">{confirmId === item.id ? <><button className="admin-delete" disabled={busy} onClick={() => remove(item.id)}>Да, удалить</button><button className="admin-delete" onClick={() => setConfirmId(null)}>Отмена</button></> : <button className="admin-delete" disabled={busy} onClick={() => setConfirmId(item.id)}>Удалить</button>}</div></article>)}</div> : <p className="empty-state">Пока ничего не загружено. Начни с первой работы или фотографии мастера.</p>}
    <Link href="/" className="text-link">Посмотреть сайт <ArrowUpRight size={18}/></Link>
  </>;
}
