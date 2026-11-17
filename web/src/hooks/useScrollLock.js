import { useEffect } from 'react';
import { useLenis } from 'lenis/react';
let locks = 0;
let previous;
export function useScrollLock(active) {
  const lenis = useLenis();
  useEffect(() => {
    if (!active) return;
    if (locks++ === 0) {
      previous = { overflow: document.body.style.overflow, paddingRight: document.body.style.paddingRight };
      const gap = innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + gap}px`;
      document.body.style.overflow = 'hidden';
    }
    lenis?.stop();
    return () => {
      if (--locks === 0) {
        Object.assign(document.body.style, previous);
        lenis?.start();
      }
    };
  }, [active, lenis]);
}
