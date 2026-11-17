import { randomUUID } from 'node:crypto';
import { config } from '../../config.js';
import { unauthorized } from '../../lib/http.js';

const sessions = new Map();
const TTL = 1000 * 60 * 60 * 6;

export const authService = {
  login(login, password) {
    for (const [token, session] of sessions) if (Date.now() >= session.expiresAt) sessions.delete(token);
    if (!login || !password) throw unauthorized('Укажите логин и пароль');
    if (login !== config.adminLogin || password !== config.adminPassword) {
      throw unauthorized('Неверный логин или пароль');
    }
    const token = randomUUID();
    sessions.set(token, { expiresAt: Date.now() + TTL });
    return { token, expiresIn: TTL };
  },
  verify(token) {
    if (!token) return false;
    const s = sessions.get(token);
    if (!s) return false;
    if (Date.now() >= s.expiresAt) {
      sessions.delete(token);
      return false;
    }
    return true;
  },
  logout(token) {
    sessions.delete(token);
  },
};