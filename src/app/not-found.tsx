import Link from "next/link";
export default function NotFound() { return <main className="simple-page"><Link className="wordmark" href="/">вайб<span>✳</span></Link><p className="mono">404 / НЕ ТА ЛИНИЯ</p><h1>Здесь пока<br/>чистая кожа.</h1><p>Эта страница не найдена. Всё самое интересное — на главной.</p><Link href="/" className="button">Вернуться в студию ↗</Link></main>; }
