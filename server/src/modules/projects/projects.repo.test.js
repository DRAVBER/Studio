import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createProjectsRepo } from './projects.repo.js';
import { parseProject } from './projects.schema.js';
const sample = parseProject({ title: 'Test project', category: 'Test', year: '2026', description: 'A complete test project.', repoUrl: 'https://example.com/project', tags: 'React, React, CSS' });
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-projects-'));
  t.after(() => { if (!path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep)) throw Error('Unsafe cleanup'); fs.rmSync(dir, { recursive: true, force: true }); });
  return { dir, filePath: path.join(dir, 'projects.json'), seed: [] };
}
test('CRUD and ordering survive a fresh repository instance', t => {
  const options = fixture(t), repo = createProjectsRepo(options);
  const a = repo.create(sample), b = repo.create(sample);
  assert.notEqual(a.id, b.id);
  repo.update(a.id, { title: 'Updated project' });
  repo.reorder([b.id, a.id]);
  const restarted = createProjectsRepo(options);
  assert.deepEqual(restarted.list().map(p => p.id), [b.id, a.id]);
  assert.equal(restarted.findById(a.id).title, 'Updated project');
  assert.deepEqual(restarted.findById(a.id).tags, ['React', 'CSS']);
  repo.remove(b.id);
  assert.equal(createProjectsRepo(options).findById(b.id), null);
});
for (const failure of ['writeFileSync', 'renameSync']) test(`${failure} failure preserves disk and memory for every mutation`, t => {
  const options = fixture(t), initial = createProjectsRepo(options);
  const a = initial.create(sample), b = initial.create(sample);
  const original = fs.readFileSync(options.filePath, 'utf8');
  const fileSystem = { ...fs, [failure]: () => { throw Object.assign(new Error('Disk unavailable'), { code: 'ENOSPC' }); } };
  const repo = createProjectsRepo({ ...options, fileSystem });
  const before = repo.list();
  for (const mutate of [() => repo.create(sample), () => repo.update(a.id, { title: 'Changed' }), () => repo.remove(a.id), () => repo.reorder([b.id, a.id])]) {
    assert.throws(mutate, error => error.status === 503);
    assert.deepEqual(repo.list(), before);
    assert.equal(fs.readFileSync(options.filePath, 'utf8'), original);
    assert.deepEqual(fs.readdirSync(options.dir), ['projects.json']);
  }
});
test('corrupt or structurally invalid saved data is not replaced by seed data', t => {
  const options = fixture(t);
  for (const content of ['{broken', '{}', JSON.stringify([{ id: 'bad', ...sample, category: 42 }])]) {
    fs.writeFileSync(options.filePath, content);
    assert.throws(() => createProjectsRepo(options), /Не удалось прочитать проекты/);
    assert.equal(fs.readFileSync(options.filePath, 'utf8'), content);
  }
});
test('wrong field types and unsafe URLs are rejected before persistence', () => {
  for (const patch of [{ category: 42 }, { details: {} }, { tags: [42] }, { tags: ['x'.repeat(41)] }, { image: '/src/photo/a.png' }, { image: 'javascript:alert(1)' }, { repoUrl: 'javascript:alert(1)' }, { palette: 'other' }]) {
    assert.throws(() => parseProject({ ...sample, ...patch }), error => error.status === 400);
  }
  assert.throws(() => parseProject(null), error => error.status === 400);
  assert.throws(() => parseProject([]), error => error.status === 400);
  assert.deepEqual(parseProject({ ...sample, tags: [' React ', 'CSS', 'React'] }).tags, ['React', 'CSS']);
});
test('bad reorder input is rejected without changing state', t => {
  const repo = createProjectsRepo(fixture(t)), a = repo.create(sample);
  for (const ids of [null, [42], ['missing'], [a.id, a.id]]) assert.throws(() => repo.reorder(ids), error => error.status === 400);
  assert.deepEqual(repo.list().map(p => p.id), [a.id]);
  assert.deepEqual(repo.list({ limit: 0 }), []);
});
