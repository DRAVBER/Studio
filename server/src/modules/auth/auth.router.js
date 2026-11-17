import { Router } from 'express';
import { asyncHandler } from '../../lib/http.js';
import { authService } from './auth.service.js';
import { requireAdmin } from './auth.middleware.js';

export const authRouter = Router();
authRouter.get('/session', requireAdmin, (_req, res) => res.json({ ok: true }));

authRouter.post('/login', asyncHandler(async (req, res) => {
  const { login, password } = req.body || {};
  res.json(authService.login(login, password));
}));

authRouter.post('/logout', asyncHandler(async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) authService.logout(token);
  res.json({ ok: true });
}));