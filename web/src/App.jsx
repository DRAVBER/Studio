import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { useHashNavigation } from './hooks/useHashNavigation.js';
import { Cursor } from './components/Cursor.jsx';
import { Grain, ProgressBar } from './components/Atmosphere.jsx';
import { Preloader } from './components/Preloader.jsx';
import { Nav } from './components/Nav.jsx';
import { Hero } from './components/Hero.jsx';
import { Marquee } from './components/Marquee.jsx';
import { About } from './components/About.jsx';
import { Work } from './components/Work.jsx';
import { Services } from './components/Services.jsx';
import { Playground } from './components/Playground.jsx';
import { Contact } from './components/Contact.jsx';
import { Footer } from './components/Footer.jsx';
import { AllProjects } from './pages/AllProjects.jsx';
const Admin = lazy(() => import('./components/Admin.jsx').then(module => ({ default: module.Admin })));
export default function App() {
  const { hash, route } = useHashNavigation();
  const [adminOpen, setAdminOpen] = useState(() => location.hash === '#admin');
  useEffect(() => setAdminOpen(hash === '#admin'), [hash]);
  useEffect(() => { document.title = route === 'projects' ? 'Все проекты — Studio' : 'Studio — Сайты с характером'; }, [route]);
  const closeAdmin = useCallback(() => {
    setAdminOpen(false);
    if (location.hash === '#admin') {
      history.replaceState(null, '', location.pathname + location.search + '#');
      window.dispatchEvent(new Event('hashchange'));
    }
  }, []);
  return <MotionConfig reducedMotion="user">
    <Preloader /><Grain /><Cursor /><ProgressBar />
    <div className="site-shell" inert={adminOpen ? '' : undefined} aria-hidden={adminOpen || undefined}>
      <a href="#contact" className="skip-link">Перейти к контактам</a>
      <Nav />
      <main>{route === 'projects' ? <AllProjects /> : <><Hero /><Marquee /><About /><Work /><Services /><Playground /><Contact /></>}</main>
      <Footer onOpenAdmin={() => setAdminOpen(true)} />
    </div>
    <Suspense fallback={adminOpen ? <div className="admin-overlay" role="status">Загружаем панель…</div> : null}>
      {adminOpen && <Admin open onClose={closeAdmin} />}
    </Suspense>
  </MotionConfig>;
}
