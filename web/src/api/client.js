import { getToken, expireSession } from './auth.js';
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
async function request(path, init = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(init.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  if (init.signal?.aborted) controller.abort();
  else init.signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 12_000);
  try {
    const res = await fetch(`${BASE}${path}`, { ...init, headers, signal: controller.signal });
    let body;
    try { body = await res.json(); } catch { throw new Error('Сервер вернул некорректный ответ. Попробуйте ещё раз.'); }
    if (!res.ok) {
      if (res.status === 401 && path !== '/auth/login') expireSession();
      const err = new Error(body?.error?.message || `Ошибка сервера (${res.status})`);
      err.status = res.status; err.details = body?.error?.details || null;
      throw err;
    }
    return body;
  } catch (err) {
    if (timedOut) throw new Error('Сервер не ответил вовремя. Попробуйте ещё раз.');
    if (err instanceof TypeError) throw new Error('Нет связи с сервером. Проверьте подключение.');
    throw err;
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener('abort', abort);
  }
}
export const api = {
  auth: {
    login: (login, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ login, password }) }),
    session: (options = {}) => request('/auth/session', options),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },
  projects: {
    list: (params = {}, options = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/projects${qs ? `?${qs}` : ''}`, options).then(reply => {
        if (!Array.isArray(reply?.data)) throw new Error('Не удалось прочитать список проектов.');
        return reply.data;
      });
    },
    create: payload => request('/projects', { method: 'POST', body: JSON.stringify(payload) }).then(r => r.data),
    update: (id, payload) => request(`/projects/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }).then(r => r.data),
    remove: id => request(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    reorder: ids => request('/projects/reorder', { method: 'PATCH', body: JSON.stringify({ ids }) }).then(r => r.data),
  },
  contacts: { submit: payload => request('/contacts', { method: 'POST', body: JSON.stringify(payload) }) },
};
