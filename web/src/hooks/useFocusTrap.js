import { useEffect } from 'react';
export function useFocusTrap(ref, onEscape, active = true) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const panel = ref.current;
    const activeElement = document.activeElement;
    const previous = panel.getAttribute('role') === 'dialog' && (panel.contains(activeElement) || activeElement === document.body)
      ? document.querySelector('[aria-label="Открыть админку"]') : activeElement;
    const focusable = () => [...panel.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]')]
      .filter(el => el.tabIndex >= 0 && !el.matches(':disabled') && !el.closest('[hidden]') && el.getClientRects().length);
    if (!panel.contains(document.activeElement)) (panel.querySelector('[data-autofocus]') || focusable()[0] || panel).focus();
    const keydown = e => {
      if (e.key === 'Escape') { e.preventDefault(); onEscape(); }
      if (e.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0], last = elements.at(-1);
      if (!first) { e.preventDefault(); panel.focus(); return; }
      if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('keydown', keydown);
      requestAnimationFrame(() => { if (previous?.isConnected && previous.getClientRects().length) previous.focus(); });
    };
  }, [ref, onEscape, active]);
}
