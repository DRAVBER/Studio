const items = ['Дизайн', 'Разработка', 'Брендинг', 'Motion', 'Стратегия'];

export function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((label, i) => <span key={i}>{label}</span>)}
      </div>
    </div>
  );
}
