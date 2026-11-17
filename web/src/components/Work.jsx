import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../hooks/useProjects.js';
import { Reveal } from './Reveal.jsx';
import { Magnetic } from './Magnetic.jsx';
import { ProjectCard } from './ProjectCard.jsx';

const PREVIEW_COUNT = 4;

function SkeletonCard() {
  return (
    <div className="card card-skeleton" aria-hidden="true">
      <div className="skeleton thumb-skeleton" />
      <div className="card-meta">
        <div className="skeleton line-skeleton w-60" />
        <div className="skeleton line-skeleton w-90" />
        <div className="skeleton line-skeleton w-40" />
      </div>
    </div>
  );
}

export function Work() {
  const { status, data, error, reload } = useProjects();
  const preview = data.slice(0, PREVIEW_COUNT);

  return (
    <section className="sec-pad" id="work" style={{ paddingTop: 20 }}>
      <div className="wrap">
        <div className="work-head">
          <div>
            <Reveal className="label">02 — Избранное</Reveal>
            <Reveal as="h2">Работы,<br />которыми <em>гордимся</em></Reveal>
          </div>
          <Magnetic as="a" href="#/projects" className="btn">
            Все проекты <span className="arr">→</span>
          </Magnetic>
        </div>

        {status === 'loading' && (
          <div className="grid" aria-busy="true" aria-label="Загрузка проектов">
            {Array.from({ length: PREVIEW_COUNT }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {status === 'error' && (
          <div className="error-block">
            <p>Не удалось загрузить проекты: {error.message}</p>
            <button className="btn" onClick={reload}>Повторить</button>
          </div>
        )}

        {status === 'success' && (
          <motion.div className="grid" layout>
            {!preview.length && <div className="empty-block"><p>Скоро здесь появятся новые работы.</p><a className="btn" href="#contact">Обсудить проект</a></div>}
            <AnimatePresence mode="popLayout">
              {preview.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} delay={i * 0.04} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
