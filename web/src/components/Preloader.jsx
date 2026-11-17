import { useEffect, useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useScrollLock } from '../hooks/useScrollLock.js';
export function Preloader() {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [progress, setProgress] = useState(0), [visible, setVisible] = useState(true), [leaving, setLeaving] = useState(false);
  useScrollLock(visible);
  useEffect(() => {
    let alive = true, raf;
    const timers = [];
    const wait = ms => new Promise(resolve => timers.push(setTimeout(resolve, ms)));
    const start = performance.now(), min = reduced ? 0 : 600;
    const tick = () => {
      if (!alive) return;
      setProgress(Math.min(95, Math.floor((performance.now() - start) / Math.max(min, 1) * 95)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    Promise.all([wait(min), Promise.race([document.fonts?.ready || Promise.resolve(), wait(1500)])]).then(async () => {
      if (!alive) return; cancelAnimationFrame(raf); setProgress(100);
      await wait(reduced ? 0 : 100);
      if (!alive) return; setLeaving(true);
      await wait(reduced ? 0 : 400);
      if (alive) setVisible(false);
    });
    return () => { alive = false; cancelAnimationFrame(raf); timers.forEach(clearTimeout); };
  }, [reduced]);
  if (!visible) return null;
  return <div className={`preloader${leaving ? ' is-leaving' : ''}`} aria-hidden="true">
    <div className="preloader-inner"><div className="preloader-brand"><span className="preloader-mark" />STUDIO</div>
      <div className="preloader-count">{String(progress).padStart(3, '0')}<span>%</span></div>
      <div className="preloader-bar"><div style={{ transform: `scaleX(${progress / 100})` }} /></div>
    </div>
  </div>;
}
