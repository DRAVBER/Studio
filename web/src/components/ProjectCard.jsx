import { forwardRef, useEffect, useId, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
export const ProjectCard = forwardRef(function ProjectCard({ project, index, delay = 0 }, ref) {
  const [expanded, setExpanded] = useState(false), [imageFailed, setImageFailed] = useState(false);
  const id = useId(), reduced = useReducedMotion();
  const details = typeof project.details === 'string' ? project.details.trim() : '';
  useEffect(() => setImageFailed(false), [project.image]);
  return <motion.article ref={ref} layout className={`card${expanded ? ' is-expanded' : ''}`}
    initial={reduced ? false : { opacity: 0, y: 38 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: reduced ? 1 : 0.92 }}
    transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : delay }}>
    <div className={`thumb p-${project.palette}`}>
      {project.image && !imageFailed && <img src={project.image} alt={project.title} className="thumb-img" loading="lazy" decoding="async" onError={() => setImageFailed(true)} />}
      <span className="idx">{String(index + 1).padStart(2, '0')} / {String(project.category).toUpperCase()}</span>
      {project.metric && <span className="metric">{project.metric}</span>}
    </div>
    <div className="card-meta"><h3>{project.title}</h3><p>{project.description}</p>
      <AnimatePresence initial={false}>{expanded && details && <motion.div key="details" id={id} className="card-details"
        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.35 }}>
        <div className="card-details-inner"><p>{details}</p></div>
      </motion.div>}</AnimatePresence>
      <div className="tags">{(project.tags || []).map((tag, i) => <span key={`${tag}-${i}`}>{tag}</span>)}<span>{project.year}</span></div>
      <div className="card-actions">
        {details && <button type="button" className="expand-btn" onClick={() => setExpanded(value => !value)} aria-expanded={expanded} aria-controls={id}>
          {expanded ? 'Свернуть' : 'Подробнее'}<span className={`chev${expanded ? ' is-up' : ''}`} aria-hidden="true">↓</span>
        </button>}
        <a className="repo-link" href={project.repoUrl} target="_blank" rel="noreferrer" aria-label={`Открыть проект ${project.title}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.27 5.69.42.36.79 1.08.79 2.18v3.23c0 .31.21.67.79.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" /></svg>
          Открыть <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  </motion.article>;
});
