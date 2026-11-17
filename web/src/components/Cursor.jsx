import { useEffect, useRef } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
export function Cursor() {
  const enabled = useMediaQuery('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const ringRef = useRef(null), dotRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const ring = ringRef.current, dot = dotRef.current, root = document.documentElement;
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, scale = 1, target = 1, raf;
    const move = event => {
      mx = event.clientX; my = event.clientY;
      root.classList.add('has-custom-cursor');
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    };
    const leave = () => root.classList.remove('has-custom-cursor');
    const over = event => {
      const active = !!event.target.closest?.('a, button, input, textarea, select, [data-cursor]');
      target = active ? 2.1 : 1; ring.classList.toggle('is-hover', active);
    };
    const tick = () => {
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2; scale += (target - scale) * 0.2;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };
    addEventListener('mousemove', move, { passive: true }); addEventListener('mouseover', over, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave); addEventListener('blur', leave);
    raf = requestAnimationFrame(tick);
    return () => {
      removeEventListener('mousemove', move); removeEventListener('mouseover', over);
      document.documentElement.removeEventListener('mouseleave', leave); removeEventListener('blur', leave);
      cancelAnimationFrame(raf); leave();
    };
  }, [enabled]);
  if (!enabled) return null;
  return <><div ref={ringRef} className="cursor" aria-hidden="true" /><div ref={dotRef} className="cursor-dot" aria-hidden="true" /></>;
}
