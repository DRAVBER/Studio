import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { projectsSeed } from './projects.data.js';
import { parseProject } from './projects.schema.js';
import { HttpError, badRequest } from '../../lib/http.js';

const defaultFile = process.env.PROJECTS_DATA_FILE || fileURLToPath(new URL('../../data/projects.json', import.meta.url));
const slugify = s => s.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40) || 'project';
const freeze = item => Object.freeze({ ...item, tags: Object.freeze([...item.tags]) });

export function createProjectsRepo({ filePath = defaultFile, seed = projectsSeed, fileSystem = fs } = {}) {
  const dataFile = path.resolve(filePath);
  fileSystem.mkdirSync(path.dirname(dataFile), { recursive: true });
  let items;
  try {
    items = fileSystem.existsSync(dataFile) ? JSON.parse(fileSystem.readFileSync(dataFile, 'utf8')) : seed;
    if (!Array.isArray(items)) throw new Error('Ожидается массив проектов');
    const ids = new Set();
    items = items.map(item => {
      if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id)) throw new Error('Некорректные или повторяющиеся ID');
      ids.add(item.id);
      return freeze({ ...item, ...parseProject(item) });
    });
  } catch (cause) {
    throw new Error(`Не удалось прочитать проекты из ${dataFile}. Исправьте файл перед запуском.`, { cause });
  }
  let store = new Map(items.map(item => [item.id, item]));
  let order = items.map(item => item.id);
  function commit(nextStore, nextOrder) {
    const tempFile = `${dataFile}.${randomUUID()}.tmp`;
    let fd;
    try {
      fd = fileSystem.openSync(tempFile, 'wx');
      fileSystem.writeFileSync(fd, JSON.stringify(nextOrder.map(id => nextStore.get(id)), null, 2), 'utf8');
      fileSystem.fsyncSync(fd);
      fileSystem.closeSync(fd);
      fd = undefined;
      fileSystem.renameSync(tempFile, dataFile);
    } catch (cause) {
      const error = new HttpError(503, 'Не удалось сохранить проекты. Попробуйте ещё раз.');
      error.cause = cause;
      throw error;
    } finally {
      if (fd !== undefined) { try { fileSystem.closeSync(fd); } catch {} }
      try { fileSystem.unlinkSync(tempFile); } catch {}
    }
    // Publish the new state only after the complete file has been replaced.
    store = nextStore;
    order = nextOrder;
  }
  return {
    list({ category, limit } = {}) {
      let result = order.map(id => store.get(id));
      if (category) result = result.filter(item => item.category.toLowerCase() === category.toLowerCase());
      if (limit !== undefined) result = result.slice(0, limit);
      return result;
    },
    findById: id => store.get(id) ?? null,
    create(data) {
      const id = `${slugify(data.title)}-${randomUUID()}`;
      const item = freeze({ ...data, id, createdAt: new Date().toISOString() });
      const next = new Map(store);
      next.set(id, item);
      commit(next, [...order, id]);
      return item;
    },
    update(id, patch) {
      const existing = store.get(id);
      if (!existing) return null;
      const item = freeze({ ...existing, ...patch, id, updatedAt: new Date().toISOString() });
      const next = new Map(store);
      next.set(id, item);
      commit(next, [...order]);
      return item;
    },
    remove(id) {
      if (!store.has(id)) return false;
      const next = new Map(store);
      next.delete(id);
      commit(next, order.filter(value => value !== id));
      return true;
    },
    reorder(ids) {
      if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string' || !store.has(id)) || new Set(ids).size !== ids.length) throw badRequest('Передайте уникальные ID существующих проектов');
      const selected = new Set(ids);
      commit(new Map(store), [...ids, ...order.filter(id => !selected.has(id))]);
      return this.list();
    },
  };
}
export const projectsRepo = createProjectsRepo();
