import { useCallback, useEffect, useRef, useState } from 'react';
import { Magnetic } from './Magnetic.jsx';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useScrollLock } from '../hooks/useScrollLock.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
const links = [
  { href: '#about', label: 'О нас' }, { href: '#work', label: 'Работы' },
  { href: '#services', label: 'Услуги' }, { href: '#contact', label: 'Контакты' },
];
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const mobile = useMediaQuery('(max-width: 900px)');
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useScrollLock(open && mobile);
  useFocusTrap(ref, close, open && mobile);
  useEffect(() => {
    const update = () => setScrolled(scrollY > 40);
    addEventListener('scroll', update, { passive: true }); update();
    addEventListener('hashchange', close);
    return () => { removeEventListener('scroll', update); removeEventListener('hashchange', close); };
  }, [close]);
  useEffect(() => { if (!mobile) close(); }, [mobile, close]);
  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-menu-open' : ''}`} ref={ref}>
      <nav className="nav-inner" aria-label="Основная навигация">
        <a href="#" className="logo" onClick={close}><i aria-hidden="true" />STUDIO</a>
        <div className="nav-links">{links.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}</div>
        <Magnetic className="btn nav-cta" href="#contact">Обсудить проект <span className="arr" aria-hidden="true">→</span></Magnetic>
        <button type="button" className="nav-toggle" aria-expanded={open} aria-controls="mobile-menu"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'} onClick={() => setOpen(value => !value)}>
          <span /><span /><span />
        </button>
      </nav>
      <nav id="mobile-menu" className="nav-mobile" hidden={!open || !mobile} aria-label="Мобильная навигация" data-lenis-prevent>
        {links.map((link, index) => <a key={link.href} href={link.href} onClick={close} data-autofocus={index === 0 ? '' : undefined}>{link.label}<span aria-hidden="true">↗</span></a>)}
        <a href="#/projects" onClick={close}>Все проекты<span aria-hidden="true">→</span></a>
      </nav>
      {open && mobile && <button className="nav-backdrop" aria-label="Закрыть меню" tabIndex={-1} onClick={close} />}
    </header>
  );
}
