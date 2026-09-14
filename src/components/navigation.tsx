"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [["Мастера", "masters"], ["Портфолио", "portfolio"], ["Стоимость", "prices"], ["Отзывы", "reviews"], ["Контакты", "contacts"]];
export function Navigation() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);
  return <header className="header">
    <a className="wordmark" href="#" aria-label="ВАЙБ — на главную">вайб<span>✳</span></a>
    <span className="header-caption">ТАТУ-СТУДИЯ<br/>МОСКВА</span>
    <nav className={`nav-links ${open ? "is-open" : ""}`} id="main-navigation" aria-label="Главная навигация">
      {links.map(([label, id]) => <a href={`#${id}`} key={id} onClick={() => setOpen(false)}>{label}</a>)}
      <a href="#booking" className="mobile-booking" onClick={() => setOpen(false)}>Обсудить идею <ArrowUpRight size={17}/></a>
    </nav>
    <a className="button button-small header-cta" href="#booking">Обсудить идею <ArrowUpRight size={17}/></a>
    <button className="menu-button" ref={button} aria-label={open ? "Закрыть меню" : "Открыть меню"} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
  </header>;
}
