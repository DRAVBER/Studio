import { Router } from 'express';
import { asyncHandler, badRequest } from '../../lib/http.js';
import { requireAdmin } from '../auth/auth.middleware.js';
import { projectsService } from './projects.service.js';

export const projectsRouter = Router();

projectsRouter.get('/', asyncHandler(async (req, res) => {
  const limit = req.query.limit === undefined ? undefined : Number(req.query.limit);
  if (limit !== undefined && (typeof req.query.limit !== 'string' || !/^\d+$/.test(req.query.limit) || !Number.isSafeInteger(limit) || limit > 500)) throw badRequest('limit: целое число от 0 до 500');
  if (req.query.category !== undefined && (typeof req.query.category !== 'string' || req.query.category.length > 40)) throw badRequest('Некорректная категория');
  const category = req.query.category?.trim();
  res.json({ data: projectsService.list({ category, limit }) });
}));

projectsRouter.get('/:id', asyncHandler(async (req, res) => {
  res.json({ data: projectsService.get(req.params.id) });
}));

projectsRouter.use(requireAdmin);

projectsRouter.post('/', asyncHandler(async (req, res) => {
  res.status(201).json({ data: projectsService.create(req.body) });
}));

projectsRouter.patch('/reorder', asyncHandler(async (req, res) => {
  res.json({ data: projectsService.reorder(req.body?.ids) });
}));

projectsRouter.put('/:id', asyncHandler(async (req, res) => {
  res.json({ data: projectsService.update(req.params.id, req.body) });
}));

projectsRouter.delete('/:id', asyncHandler(async (req, res) => {
  res.json(projectsService.remove(req.params.id));
}));