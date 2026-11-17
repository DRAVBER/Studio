import { useEffect, useRef, useState } from 'react';
import { Reveal } from './Reveal.jsx';
import { ProfileCard } from './ProfileCard.jsx';
import { profile } from '../config/contacts.js';

function Counter({ to, duration = 1400 }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) return setN(to);
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{n}</span>;
}

const stats = [
  { to: 7,  label: 'ЛЕТ ОПЫТА' },
  { to: 54, label: 'ПРОЕКТОВ' },
  { to: 12, label: 'НАГРАД' },
  { to: null, label: 'ИДЕЙ В ЗАПАСЕ', inf: true },
];

export function About() {
  return (
    <section className="sec-pad" id="about">
      <div className="wrap">
        <Reveal className="label">01 — О нас</Reveal>

        <Reveal as="h2" style={{ marginBottom: 56 }}>
          Мы не рисуем<br /><em>красивые картинки.</em>
        </Reveal>

        <div className="about-grid about-grid--card">
          <ProfileCard profile={profile} />

          <div className="about-right">
            <Reveal as="p" className="about-lead">
              Мы строим цифровые продукты, которые <strong>работают на бизнес</strong>.
              Начинаем с вопроса «зачем», а не «как красивее» — и только потом
              берёмся за пиксели, типографику и анимации.
            </Reveal>

            <Reveal as="p" delay={0.1}>
              Небольшая команда, прямые руки и полный цикл: от стратегии и
              прототипа до продакшена и передачи в поддержку.
            </Reveal>

            <Reveal className="stats" delay={0.2}>
              {stats.map((s) => (
                <div className="stat" key={s.label}>
                  <b>{s.inf ? <>∞<i>*</i></> : <Counter to={s.to} />}</b>
                  <small>{s.label}</small>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}