import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '../api/client.js';
import { getToken, setToken, clearToken } from '../api/auth.js';
import { useScrollLock } from '../hooks/useScrollLock.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { AdminLogin } from './AdminLogin.jsx';
import { ProjectForm } from './ProjectForm.jsx';

function ProjectRow({ project, index, count, disabled, onEdit, onDelete, onMove, onDragEnd }) {
  const controls = useDragControls();
  return <Reorder.Item value={project} className={`admin-item${index < 4 ? ' is-home' : ''}`}
    dragListener={false} dragControls={controls} onDragEnd={onDragEnd} whileDrag={{ scale: 1.02, zIndex: 10 }}>
    <button type="button" className="admin-item-grip" disabled={disabled}
      aria-label={`Перетащить ${project.title}`} onPointerDown={event => controls.start(event)}>⋮⋮</button>
    <span className="admin-item-title">{project.title}</span>
    {index < 4 && <span className="admin-badge">главная</span>}
    <div className="admin-item-actions">
      <button type="button" className="admin-icon-btn" disabled={disabled || index === 0} onClick={() => onMove(index, -1)} aria-label={`Поднять ${project.title}`}>↑</button>
      <button type="button" className="admin-icon-btn" disabled={disabled || index === count - 1} onClick={() => onMove(index, 1)} aria-label={`Опустить ${project.title}`}>↓</button>
      <button type="button" className="admin-icon-btn" disabled={disabled} onClick={() => onEdit(project)} aria-label={`Редактировать ${project.title}`}>✎</button>
      <button type="button" className="admin-icon-btn danger" disabled={disabled} onClick={() => onDelete(project)} aria-label={`Удалить ${project.title}`}>×</button>
    </div>
  </Reorder.Item>;
}
export function Admin({ open, onClose }) {
  const [authed, setAuthed] = useState(() => !!getToken());
  const [items, setItems] = useState([]), [loading, setLoading] = useState(true), [loadError, setLoadError] = useState(null);
  const [editing, setEditing] = useState(null), [saving, setSaving] = useState(false), [ordering, setOrdering] = useState(false);
  const [reload, setReload] = useState(0);
  const panel = useRef(null), mounted = useRef(true), current = useRef([]), chain = useRef(Promise.resolve()), version = useRef(0);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useScrollLock(open);
  useEffect(() => {
    const expired = () => { setAuthed(false); setEditing(null); setItems([]); toast.info('Сессия завершена. Войдите снова.'); };
    addEventListener('auth-expired', expired);
    return () => removeEventListener('auth-expired', expired);
  }, []);
  useEffect(() => {
    if (!open || !authed) return;
    const controller = new AbortController();
    setLoading(true); setLoadError(null);
    (async () => {
      await api.auth.session({ signal: controller.signal });
      const data = await api.projects.list({}, { signal: controller.signal });
      if (!controller.signal.aborted) { current.current = data; setItems(data); }
    })().catch(error => { if (!controller.signal.aborted && error.status !== 401) setLoadError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, authed, reload]);
  const notify = () => window.dispatchEvent(new Event('projects-updated'));
  const close = useCallback(async () => {
    if (saving) return;
    await chain.current;
    if (mounted.current) onClose();
  }, [saving, onClose]);
  useFocusTrap(panel, close, open);
  const saveOrder = next => {
    const revision = ++version.current;
    setOrdering(true);
    const job = chain.current.then(async () => {
      try {
        const saved = await api.projects.reorder(next.map(project => project.id));
        if (mounted.current && revision === version.current) { current.current = saved; setItems(saved); }
        notify();
      } catch (error) {
        if (mounted.current && error.status !== 401) {
          toast.error(error.message);
          if (revision === version.current) {
            try { const fresh = await api.projects.list(); current.current = fresh; setItems(fresh); } catch { setLoadError('Не удалось проверить порядок проектов. Обновите список.'); }
          }
        }
        throw error;
      } finally { if (mounted.current && revision === version.current) setOrdering(false); }
    });
    chain.current = job.catch(() => {});
    return job;
  };
  const move = (index, direction) => {
    const next = [...current.current], other = index + direction;
    if (other < 0 || other >= next.length) return;
    [next[index], next[other]] = [next[other], next[index]];
    current.current = next; setItems(next); void saveOrder(next).catch(() => {});
  };
  const mutate = async operation => {
    setSaving(true);
    try { await chain.current; return await operation(); } finally { if (mounted.current) setSaving(false); }
  };
  const create = values => mutate(async () => {
    const project = await api.projects.create(values);
    current.current = [...current.current, project]; setItems(current.current);
    toast.success(`«${project.title}» добавлен`); notify();
    return project;
  });
  const edit = values => mutate(async () => {
    const project = await api.projects.update(editing.id, values);
    current.current = current.current.map(item => item.id === project.id ? project : item); setItems(current.current); setEditing(null);
    toast.success('Сохранено'); notify();
    return project;
  });
  const remove = async project => {
    if (!confirm(`Удалить «${project.title}»?`)) return;
    try {
      await mutate(async () => {
        await api.projects.remove(project.id);
        current.current = current.current.filter(item => item.id !== project.id); setItems(current.current);
        if (editing?.id === project.id) setEditing(null);
        toast.success(`«${project.title}» удалён`); notify();
      });
    } catch (error) { if (error.status !== 401) toast.error(error.message); }
  };
  const logout = async () => {
    try {
      await mutate(async () => { await api.auth.logout(); clearToken(); setAuthed(false); setEditing(null); onClose(); });
    } catch (error) { if (error.status !== 401) toast.error(error.message); }
  };
  if (!open) return null;
  const busy = saving || ordering;
  return <motion.div className="admin-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
    <motion.div className="admin-panel" ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="admin-title"
      data-lenis-prevent layoutScroll onClick={event => event.stopPropagation()} initial={{ y: 24 }} animate={{ y: 0 }}>
      <header className="admin-header"><h2 id="admin-title">{authed ? 'Управление проектами' : 'Админка'}</h2>
        <div className="admin-header-actions">{authed && <button className="btn btn-ghost" disabled={busy} onClick={logout}>Выйти</button>}
          <button className="btn" disabled={saving} onClick={close}>Закрыть</button></div>
      </header>
      {!authed ? <AdminLogin onSuccess={(token, ttl) => { setToken(token, ttl); setAuthed(true); }} /> :
        <div className="admin-grid"><section>
          <h3>Проекты ({items.length})</h3><p className="admin-hint">Первые 4 — на главной. Меняйте порядок стрелками или перетаскивайте за ⋮⋮.</p>
          <p className="admin-save-status" role="status">{ordering ? 'Сохраняем порядок…' : ''}</p>
          {loading ? <div className="skeleton" style={{ height: 120, borderRadius: 14 }} /> : loadError ?
            <div className="error-block"><p>{loadError}</p><button className="btn" onClick={() => setReload(value => value + 1)}>Повторить</button></div> :
            <><Reorder.Group axis="y" values={items} onReorder={next => { current.current = next; setItems(next); }} className="admin-sortable">
              {items.map((project, index) => <ProjectRow key={project.id} project={project} index={index} count={items.length} disabled={busy}
                onEdit={setEditing} onDelete={remove} onMove={move} onDragEnd={() => { void saveOrder(current.current).catch(() => {}); }} />)}
            </Reorder.Group>{!items.length && <p className="admin-hint">Пока нет проектов. Добавьте первый справа или ниже.</p>}</>}
        </section><section>
          <ProjectForm key={editing?.id || 'create'} mode={editing ? 'edit' : 'create'} initial={editing} onSubmit={editing ? edit : create}
            onCancel={() => setEditing(null)} submitting={busy || loading || !!loadError} />
        </section></div>}
    </motion.div>
  </motion.div>;
}
