import { useEffect, useRef } from 'react';
import { Magnetic } from './Magnetic.jsx';

function useParallax() {
  const ref = useRef(null);
  useEffect(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const el = ref.current;
    if (!el) return;
    const wraps = el.querySelectorAll('[data-parallax]');
    let px = 0, py = 0, cx = 0, cy = 0, raf;
    const onMove = (e) => {
      px = e.clientX / innerWidth - 0.5;
      py = e.clientY / innerHeight - 0.5;
    };
    const tick = () => {
      cx += (px - cx) * 0.06;
      cy += (py - cy) * 0.06;
      wraps.forEach((w) => {
        const s = parseFloat(w.dataset.parallax) || 1;
        w.style.transform = `translate3d(${cx * 44 * s}px, ${cy * 44 * s}px, 0)`;
      });
      raf = requestAnimationFrame(tick);
    };
    addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);
  return ref;
}

export function Hero() {
  const ref = useParallax();
  return (
    <section className="hero" ref={ref}>
      <div className="blobs" aria-hidden="true">
        <div className="blob-wrap b1" data-parallax="1.4"><div className="blob" /></div>
        <div className="blob-wrap b2" data-parallax="-1.1"><div className="blob" /></div>
        <div className="blob-wrap b3" data-parallax="0.7"><div className="blob" /></div>
      </div>

      <div className="wrap hero-inner">
        <div className="badge"><span className="pulse" /> Открыты для проектов — 2026</div>

        <h1 className="hero-title">
          <span className="line"><span>Сайты</span></span>
          <span className="line"><span>с <em>характером</em></span></span>
        </h1>

        <p className="hero-sub">
          Продуктовый дизайн и разработка, от которых сложно отвести взгляд.
          Собираем интерфейсы, которые продают, и бренды, которые запоминают.
        </p>

        <div className="hero-actions">
          <Magnetic className="btn btn-solid" href="#work">
            Смотреть работы <span className="arr">→</span>
          </Magnetic>
          <Magnetic className="btn" href="#services">Что мы делаем</Magnetic>
        </div>
      </div>
    </section>
  );
}
