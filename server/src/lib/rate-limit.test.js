import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimit } from './rate-limit.js';
test('rolling request limit returns 429 and becomes available at window boundary', () => {
  let time = 1000;
  const check = createRateLimit({ now: () => time });
  check('client'); check('client'); check('client');
  assert.throws(() => check('client'), error => error.status === 429 && error.details.retryAfter === 60);
  check('another-client');
  time += 60_000;
  assert.doesNotThrow(() => check('client'));
});
