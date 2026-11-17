import { Reveal } from './Reveal.jsx';

const services = [
  { n: '01', title: 'Стратегия',      desc: 'Исследование, позиционирование, структура' },
  { n: '02', title: 'UI/UX дизайн',   desc: 'Прототипы, интерфейсы, дизайн-системы' },
  { n: '03', title: 'Разработка',     desc: 'Frontend, backend, интеграции' },
  { n: '04', title: 'Брендинг',       desc: 'Логотип, айдентика, гайдлайны' },
  { n: '05', title: 'Motion & 3D',    desc: 'Анимация, микровзаимодействия, рендеры' },
];

export function Services() {
  return (
    <section className="sec-pad" id="services">
      <div className="wrap">
        <Reveal className="label">03 — Услуги</Reveal>
        <Reveal as="h2" style={{ marginBottom: 56 }}>Полный <em>цикл</em></Reveal>
        <ul className="services">
          {services.map((s, i) => (
            <li key={s.n}>
              <Reveal as="a" href="#contact" className="service" delay={i * 0.06}>
                <span className="num">{s.n}</span>
                <h3>{s.title}</h3>
                <span className="desc">{s.desc}</span>
                <span className="arrow">↗</span>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
