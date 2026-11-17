import { authService } from './auth.service.js';
import { unauthorized } from '../../lib/http.js';

export function requireAdmin(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!authService.verify(token)) return next(unauthorized());
  next();
}