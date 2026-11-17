import { Router } from 'express';
import { asyncHandler } from '../../lib/http.js';
import { contactsService } from './contacts.service.js';

export const contactsRouter = Router();

contactsRouter.post('/', asyncHandler(async (req, res) => {
  const result = await contactsService.submit(req.body, { ip: req.ip });
  res.status(201).json(result);
}));
