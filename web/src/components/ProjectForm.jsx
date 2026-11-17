import { useEffect, useId, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { projectSchema, palettes } from '../lib/project-schema.js';
export function ProjectForm({ mode, initial, onSubmit, onCancel, submitting }) {
  const prefix = useId();
  const defaults = useMemo(() => ({
    title: initial?.title || '', category: initial?.category || '', year: String(initial?.year || new Date().getFullYear()),
    description: initial?.description || '', details: initial?.details || '', image: initial?.image || '',
    repoUrl: initial?.repoUrl || '', tags: (initial?.tags || []).join(', '), palette: initial?.palette || 'purple', metric: initial?.metric || '',
  }), [initial]);
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({ resolver: zodResolver(projectSchema), defaultValues: defaults });
  useEffect(() => reset(defaults), [defaults, reset]);
  const submit = async values => {
    try { await onSubmit(values); if (mode === 'create') reset(defaults); }
    catch (error) {
      Object.entries(error.details || {}).forEach(([key, message]) => { if (key in defaults) setError(key, { type: 'server', message }); });
      if (error.status !== 401) toast.error(error.message);
    }
  };
  const field = (name, label, { maxLength, placeholder, rows, hint, inputMode } = {}) => {
    const id = `${prefix}-${name}`, error = errors[name];
    const props = { id, maxLength, placeholder, inputMode, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined, ...register(name) };
    return <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {rows ? <textarea rows={rows} {...props} /> : <input {...props} />}
      {hint && <span className="admin-hint" id={`${id}-hint`}>{hint}</span>}
      {error && <span className="error" id={`${id}-error`} role="alert">{error.message}</span>}
    </div>;
  };
  return <form className="admin-form" onSubmit={handleSubmit(submit)} noValidate>
    <h3>{mode === 'edit' ? 'Редактировать' : 'Новый проект'}</h3>
    <fieldset disabled={submitting}>
      <div className="admin-row">{field('title', 'Название', { maxLength: 80 })}{field('category', 'Категория', { maxLength: 40, placeholder: 'E-commerce' })}</div>
      <div className="admin-row">{field('year', 'Год', { maxLength: 4, inputMode: 'numeric', placeholder: '2026' })}
        <div className="field"><label htmlFor={`${prefix}-palette`}>Палитра</label><select id={`${prefix}-palette`} {...register('palette')}>{palettes.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
      </div>
      {field('image', 'Картинка (путь или URL)', { maxLength: 500, placeholder: '/photo/image.png или https://…',
        hint: <>Для файла в <code>web/public/photo/</code> укажите <code>/photo/имя.png</code>. Палитра используется, если картинки нет.</> })}
      {field('description', 'Краткое описание', { maxLength: 500, rows: 3 })}
      {field('details', 'Полное описание', { maxLength: 5000, rows: 5, placeholder: 'Задача, решение, стек и результат…' })}
      {field('repoUrl', 'GitHub / ссылка на проект', { maxLength: 500, placeholder: 'https://github.com/…' })}
      <div className="admin-row">{field('tags', 'Теги через запятую', { maxLength: 200, placeholder: 'UX/UI, Motion' })}{field('metric', 'Метрика', { maxLength: 60, placeholder: '+38% конверсия' })}</div>
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-solid">{submitting ? 'Сохраняем…' : mode === 'edit' ? 'Сохранить' : 'Добавить'}</button>
        {mode === 'edit' && <button type="button" className="btn" onClick={onCancel}>Отмена</button>}
      </div>
    </fieldset>
  </form>;
}
