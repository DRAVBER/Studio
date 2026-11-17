import { useEffect, useState } from 'react';
import { useLenis } from 'lenis/react';
import { useMediaQuery } from './useMediaQuery.js';
const targets = new Set(['#', '#about', '#work', '#services', '#contact', '#/projects', '#admin']);
export function useHashNavigation() {
  const lenis = useLenis();
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [navigation, setNavigation] = useState(() => ({ hash: location.hash, key: 0 }));
  useEffect(() => {
    const update = () => setNavigation(prev => ({ hash: location.hash, key: prev.key + 1 }));
    const click = event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
      const anchor = event.target.closest?.('a[href^="#"]');
      const hash = anchor?.getAttribute('href');
      if (!targets.has(hash) || anchor.target === '_blank') return;
      event.preventDefault();
      if (location.hash !== hash && !(hash === '#' && !location.hash)) history.pushState(null, '', location.pathname + location.search + hash);
      update();
    };
    addEventListener('hashchange', update);
    addEventListener('popstate', update);
    document.addEventListener('click', click);
    return () => {
      removeEventListener('hashchange', update); removeEventListener('popstate', update);
      document.removeEventListener('click', click);
    };
  }, []);
  useEffect(() => {
    if (navigation.hash === '#admin') return;
    let cancelled = false, userInteracted = false;
    const settleUntil = performance.now() + 2500;
    const scroll = (immediate = false) => {
      if (cancelled) return;
      const id = navigation.hash.slice(1);
      const target = !id.startsWith('/') && id ? document.getElementById(id) : null;
      const offset = (document.querySelector('.nav')?.getBoundingClientRect().height || 70) + 16;
      const top = target ? Math.max(0, target.getBoundingClientRect().top + scrollY - offset) : 0;
      const instant = immediate || reduced || !target;
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(top, { immediate: instant, duration: 0.8, force: true });
      }
      else window.scrollTo({ top, behavior: instant ? 'instant' : 'smooth' });
    };
    const raf = requestAnimationFrame(() => scroll(navigation.key === 0));
    const settled = () => { if (!userInteracted && performance.now() < settleUntil) scroll(true); };
    const interact = () => { userInteracted = true; };
    window.addEventListener('page-content-ready', settled);
    window.addEventListener('wheel', interact, { passive: true });
    window.addEventListener('pointerdown', interact, { passive: true });
    window.addEventListener('keydown', interact);
    if (navigation.key === 0) document.fonts?.ready.then(() => scroll(true));
    return () => {
      cancelled = true; cancelAnimationFrame(raf);
      window.removeEventListener('page-content-ready', settled);
      window.removeEventListener('wheel', interact); window.removeEventListener('pointerdown', interact); window.removeEventListener('keydown', interact);
    };
  }, [navigation, lenis, reduced]);
  return { hash: navigation.hash, route: navigation.hash === '#/projects' ? 'projects' : 'home' };
}
