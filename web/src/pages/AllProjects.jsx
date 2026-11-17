import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../hooks/useProjects.js';
import { ProjectCard } from '../components/ProjectCard.jsx';
export function AllProjects() {
  const { status, data, error, reload } = useProjects();
  const [search, setSearch] = useState(''), [category, setCategory] = useState('');
  const categories = useMemo(() => [...new Set(data.map(project => project.category))].sort(), [data]);
  const filtered = useMemo(() => data.filter(project => (!category || project.category === category) &&
    [project.title, project.description, ...project.tags].join(' ').toLocaleLowerCase('ru').includes(search.trim().toLocaleLowerCase('ru'))), [data, category, search]);
  return <section className="all-projects"><div className="wrap">
    <a href="#" className="back-link"><span aria-hidden="true">←</span> На главную</a>
    <h1 className="all-title">Все <em>проекты</em></h1>
    <p className="all-lead">Полный список того, что мы сделали — от концепта до продакшена.</p>
    {status === 'loading' && <div className="grid" aria-busy="true" aria-label="Загрузка проектов">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 24 }} />)}</div>}
    {status === 'error' && <div className="error-block" role="alert"><p>Не удалось загрузить проекты: {error.message}</p><button className="btn" onClick={reload}>Повторить</button></div>}
    {status === 'success' && <>
      <div className="project-filters">
        <div className="field"><label htmlFor="project-search">Поиск проектов</label><input id="project-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Название, описание или тег" /></div>
        <div className="field"><label htmlFor="project-category">Категория</label><select id="project-category" value={category} onChange={event => setCategory(event.target.value)}><option value="">Все категории</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select></div>
      </div>
      <p className="project-count" role="status">Найдено проектов: {filtered.length}</p>
      <motion.div className="grid" layout><AnimatePresence mode="popLayout">{filtered.map((project, index) => <ProjectCard key={project.id} project={project} index={index} delay={Math.min(index * 0.04, 0.3)} />)}</AnimatePresence></motion.div>
      {!filtered.length && <div className="empty-block"><h2>{data.length ? 'Ничего не найдено' : 'Скоро здесь появятся проекты'}</h2>
        {data.length ? <button className="btn" onClick={() => { setSearch(''); setCategory(''); }}>Сбросить фильтры</button> : <a className="btn" href="#contact">Обсудить проект</a>}</div>}
    </>}
  </div></section>;
}
