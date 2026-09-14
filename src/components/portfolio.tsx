"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { categories } from "@/lib/content";
import type { GalleryItem } from "@/lib/gallery";
import { Artwork } from "./artwork";
import { mediaPath } from "@/lib/deployment";

const examples = [
  { id: "demo-eye", title: "Взгляд глубже", category: "Реализм", art: "eye" },
  { id: "demo-flower", title: "Ближе к природе", category: "Ботаника", art: "flower" },
  { id: "demo-koi", title: "В своём потоке", category: "Япония", art: "koi" },
  { id: "demo-star", title: "Своя орбита", category: "Графика", art: "star" },
];
type DisplayWork = { id: string; title: string; category: string; art?: string };
export function Portfolio({ works }: { works: GalleryItem[] }) {
  const [category, setCategory] = useState("Все работы");
  const [selected, setSelected] = useState<DisplayWork | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const list: DisplayWork[] = works.length ? works : examples;
  const filtered = list.filter(item => category === "Все работы" || item.category === category);
  return <>
    <div className="portfolio-toolbar"><div className="filter-list" aria-label="Фильтр по стилю">{categories.map(c => <button key={c} onClick={() => setCategory(c)} className={category === c ? "filter active" : "filter"} aria-pressed={category === c}>{c}</button>)}</div><span className="mono work-count">{String(filtered.length).padStart(2, "0")} / {String(list.length).padStart(2, "0")}</span></div>
    {!works.length && <p className="demo-note">Эскизы-настроения для вдохновения. Фотографии работ студии появятся здесь скоро.</p>}
    <div className="portfolio-grid">
      {filtered.map((item, i) => <button className={`work-card work-tone-${i % 4}`} key={item.id} onClick={() => { setSelected(item); dialog.current?.showModal(); }} aria-label={`Рассмотреть: ${item.title}`}>
        <div className="work-visual">{item.art ? <Artwork kind={item.art}/> : <Image src={mediaPath(item.id)} alt={item.title} fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"/>}<span className="work-expand"><ArrowUpRight size={20}/></span>{item.art && <span className="art-label mono">VIBE FLASH / 0{i + 1}</span>}</div>
        <div className="work-caption"><h3>{item.title}</h3><span>{item.category}</span></div>
      </button>)}
    </div>
    {filtered.length === 0 && <p className="empty-state">В этом стиле пока нет работ. Посмотри другие направления или расскажи нам о своей идее.</p>}
    <dialog ref={dialog} className="lightbox" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <button className="lightbox-close" aria-label="Закрыть изображение" onClick={() => dialog.current?.close()}><X/></button>
      {selected && <div className="lightbox-content"><div className="lightbox-image">{selected.art ? <Artwork kind={selected.art}/> : <Image src={mediaPath(selected.id)} alt={selected.title} fill sizes="90vw"/>}</div><h3>{selected.title}</h3><p>{selected.category}{selected.art ? " · демонстрационный эскиз" : ""}</p></div>}
    </dialog>
  </>;
}
