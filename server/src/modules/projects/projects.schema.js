import { validate } from '../../lib/validate.js';

export function isHttpUrl(value) {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}
export function isImageUrl(value) {
  return isHttpUrl(value) || (/^\/(?!\/)/.test(value) && !value.startsWith('/src/') && !value.includes('\\') && !value.split('/').includes('..'));
}
export const projectCreateSchema = {
  title: { required: true, min: 2, max: 80 },
  category: { required: true, min: 2, max: 40 },
  year: { type: ['string', 'number'], required: true, pattern: /^\d{4}$/, message: 'Год в формате YYYY' },
  description: { required: true, min: 10, max: 500 },
  details: { max: 5000 },
  image: { max: 500, check: isImageUrl, message: 'Используйте /photo/имя.png или URL http(s)://' },
  repoUrl: { required: true, max: 500, check: isHttpUrl, message: 'Введите корректный URL http(s)://' },
  tags: { type: ['string', 'array'], max: 200 },
  palette: { enum: ['purple', 'magenta', 'indigo', 'cyan'] },
  metric: { max: 60 },
};
export function parseProject(input) {
  const clean = validate(projectCreateSchema, input);
  const tags = typeof clean.tags === 'string' ? clean.tags.split(',') : clean.tags || [];
  const normalizedTags = [...new Set(tags.map(tag => tag.trim()).filter(Boolean))];
  validate({ tags: projectCreateSchema.tags }, { tags: normalizedTags });
  return {
    title: clean.title, category: clean.category, year: Number(clean.year),
    description: clean.description, details: clean.details || '', image: clean.image || null,
    repoUrl: clean.repoUrl, palette: clean.palette || 'purple', metric: clean.metric || null,
    tags: normalizedTags,
  };
}
