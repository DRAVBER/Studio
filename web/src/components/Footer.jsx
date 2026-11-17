export function Footer({ onOpenAdmin }) {
  return (
    <footer>
      <div className="wrap foot">
        <span>© 2026 Studio — сделано с любовью и кофе</span>
        <div className="foot-right">
          <span>Санкт-Петербург · работаем по всему миру</span>
          <button className="link-btn" onClick={onOpenAdmin} aria-label="Открыть админку">Админка</button>
        </div>
      </div>
    </footer>
  );
}
