import { randomUUID } from 'node:crypto';
import { validate } from '../../lib/validate.js';
import { createRateLimit } from '../../lib/rate-limit.js';
import { contactSchema } from './contacts.schema.js';
import { deliverContact } from './contacts.delivery.js';

const submissions = [];
const checkRate = createRateLimit();
export const contactsService = {
  async submit(input, meta = {}) {
    checkRate(meta.ip || 'unknown');
    const data = validate(contactSchema, input);
    if (data.trap) return { ok: true, delivered: false };
    const entry = {
      id: randomUUID(), name: data.name, email: data.email, message: data.message,
      ip: meta.ip, createdAt: new Date().toISOString(),
    };
    const delivery = await deliverContact(entry);
    submissions.push(entry);
    if (submissions.length > 500) submissions.shift();
    return { ok: true, id: entry.id, delivered: delivery.delivered === true };
  },
  list: () => [...submissions],
};
