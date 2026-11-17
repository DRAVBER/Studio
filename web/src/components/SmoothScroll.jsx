import { ReactLenis } from 'lenis/react';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
export function SmoothScroll({ children }) {
  const smooth = useMediaQuery('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  if (!smooth) return children;
  return <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, allowNestedScroll: true }}>{children}</ReactLenis>;
}
