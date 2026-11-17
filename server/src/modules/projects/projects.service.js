import { projectsRepo } from './projects.repo.js';
import { parseProject } from './projects.schema.js';
import { badRequest, notFound } from '../../lib/http.js';

export const projectsService = {
  list: query => projectsRepo.list(query),
  get(id) {
    const item = projectsRepo.findById(id);
    if (!item) throw notFound('Проект не найден');
    return item;
  },
  create: input => projectsRepo.create(parseProject(input)),
  update(id, input) {
    const existing = this.get(id);
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw badRequest('Ожидается JSON-объект');
    return projectsRepo.update(id, parseProject({ ...existing, ...input }));
  },
  remove(id) {
    if (!projectsRepo.remove(id)) throw notFound('Проект не найден');
    return { ok: true };
  },
  reorder: ids => projectsRepo.reorder(ids),
};
