import Link from "next/link";
import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin-panel";
import { getGallery } from "@/lib/gallery";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Управление изображениями", robots: { index: false, follow: false }, alternates: { canonical: "/admin" } };
export default async function Admin() { return <main className="simple-page admin-page"><Link className="wordmark" href="/" aria-label="ВАЙБ — на главную">вайб<span>✳</span></Link><span className="section-label mono">СТУДИЯ / УПРАВЛЕНИЕ</span><h1>ТВОИ РАБОТЫ.<br/>ТВОЁ ПОРТФОЛИО.</h1><AdminPanel initial={await getGallery()}/></main>; }
