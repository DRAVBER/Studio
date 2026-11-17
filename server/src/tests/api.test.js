import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-api-'));
process.env.PROJECTS_DATA_FILE = path.join(dir, 'projects.json');
process.env.TRUST_PROXY = 'false';
const { createApp } = await import('../app.js');
const { config } = await import('../config.js');
const server = createApp().listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}/api`;
after(async () => {
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
  if (!path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep)) throw Error('Unsafe cleanup');
  fs.rmSync(dir, { recursive: true, force: true });
});
async function request(endpoint, { method = 'GET', payload, token, headers = {} } = {}) {
  const reply = await fetch(base + endpoint, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) }) });
  return { status: reply.status, body: await reply.json(), headers: reply.headers };
}
async function login() {
  const result = await request('/auth/login', { method: 'POST', payload: { login: config.adminLogin, password: config.adminPassword } });
  assert.equal(result.status, 200); return result.body.token;
}
test('session check rejects stale tokens and logout revokes a valid token', async () => {
  assert.equal((await request('/auth/session', { token: 'stale' })).status, 401);
  const token = await login();
  assert.equal((await request('/auth/session', { token })).status, 200);
  assert.equal((await request('/auth/logout', { method: 'POST', token })).status, 200);
  assert.equal((await request('/auth/session', { token })).status, 401);
});
test('public reads, protected mutations and strict query validation', async () => {
  assert.equal((await request('/projects')).status, 200);
  assert.equal((await request('/projects', { method: 'POST', payload: {} })).status, 401);
  assert.deepEqual((await request('/projects?limit=0')).body.data, []);
  for (const query of ['limit=-1', 'limit=abc', 'limit=501', 'limit=1&limit=2', 'category[x]=1']) assert.equal((await request('/projects?' + query)).status, 400);
});
test('invalid payload is rejected; a valid project can be saved, read, edited and deleted', async () => {
  const token = await login(), sample = { title: 'API test', category: 'Test', year: '2026', description: 'An API test project.', repoUrl: 'https://example.com/project', tags: ['React', 'CSS'] };
  assert.equal((await request('/projects', { method: 'POST', token, payload: { ...sample, category: 42 } })).status, 400);
  assert.equal((await request('/projects', { method: 'POST', token, payload: [] })).status, 400);
  const created = await request('/projects', { method: 'POST', token, payload: sample });
  assert.equal(created.status, 201);
  const id = created.body.data.id;
  assert.equal((await request('/projects/' + id)).body.data.title, sample.title);
  assert.equal((await request('/projects/' + id, { method: 'PUT', token, payload: { title: 'Updated API test' } })).status, 200);
  assert.equal((await request('/projects/' + id, { method: 'DELETE', token })).status, 200);
  assert.equal((await request('/projects/' + id)).status, 404);
});
test('changing X-Forwarded-For cannot bypass contact limit with direct access', async () => {
  const payload = { name: 'Test', email: 'test@example.com', message: 'A test contact request.', trap: '' };
  for (let i = 0; i < 3; i++) {
    const reply = await request('/contacts', { method: 'POST', payload, headers: { 'X-Forwarded-For': `192.0.2.${i + 1}` } });
    assert.equal(reply.status, 201); assert.equal(reply.body.delivered, false);
  }
  const reply = await request('/contacts', { method: 'POST', payload, headers: { 'X-Forwarded-For': '192.0.2.99' } });
  assert.equal(reply.status, 429); assert.ok(Number(reply.headers.get('retry-after')) > 0);
});
