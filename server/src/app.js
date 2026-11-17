import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { HttpError } from './lib/http.js';
import { authRouter } from './modules/auth/auth.router.js';
import { projectsRouter } from './modules/projects/projects.router.js';
import { contactsRouter } from './modules/contacts/contacts.router.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(helmet({ contentSecurityPolicy: { directives: { imgSrc: ["'self'", 'https:', 'data:'] } } }));
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '100kb' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));
  app.use('/api/auth', authRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/contacts', contactsRouter);
  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Не найдено')));

  const webDist = fileURLToPath(new URL('../../web/dist/', import.meta.url));
  app.use(express.static(webDist, { index: false }));
  app.get('*', (req, res, next) => {
    const index = path.join(webDist, 'index.html');
    if (path.extname(req.path) || !fs.existsSync(index)) return next();
    res.sendFile(index);
  });

  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    if (status >= 500) console.error('[api]', err);
    if (status === 429 && err.details?.retryAfter) res.set('Retry-After', String(err.details.retryAfter));
    res.status(status).json({ error: {
      message: err instanceof HttpError || status < 500 ? err.message : 'Внутренняя ошибка сервера',
      details: err.details || null,
    } });
  });
  return app;
}
