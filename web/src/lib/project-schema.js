import { z } from 'zod';
const httpUrl = value => { try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } };
const imageUrl = value => !value || httpUrl(value) || (/^\/(?!\/)/.test(value) && !value.startsWith('/src/') && !value.includes('\\') && !value.split('/').includes('..'));
const text = (min, max) => z.string().trim().min(min, `Минимум ${min} символов`).max(max, `Максимум ${max} символов`);
export const palettes = ['purple', 'magenta', 'indigo', 'cyan'];
export const projectSchema = z.object({
  title: text(2, 80), category: text(2, 40), year: z.string().regex(/^\d{4}$/, 'Год в формате YYYY'),
  description: text(10, 500), details: text(0, 5000), image: text(0, 500).refine(imageUrl, 'Используйте /photo/имя.png или URL http(s)://'),
  repoUrl: text(1, 500).refine(httpUrl, 'Введите корректный URL http(s)://'),
  tags: text(0, 200).refine(value => { const tags = value.split(',').map(t => t.trim()).filter(Boolean); return tags.length <= 20 && tags.every(t => t.length <= 40); }, 'До 20 тегов, максимум 40 символов каждый'),
  palette: z.enum(palettes), metric: text(0, 60),
});
