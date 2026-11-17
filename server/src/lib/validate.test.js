import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from './validate.js';
import { HttpError } from './http.js';

test('trim + min/max', () => {
  const out = validate({ name: { required: true, min: 2, max: 10 } }, { name: '  Vasya  ' });
  assert.equal(out.name, 'Vasya');
});

test('required → 400 + details', () => {
  assert.throws(
    () => validate({ name: { required: true } }, {}),
    (err) => err instanceof HttpError && err.status === 400 && err.details.name === 'Обязательное поле'
  );
});

test('pattern', () => {
  assert.throws(
    () => validate({ email: { required: true, pattern: /^[^@]+@[^@]+\.[^@]+$/ } }, { email: 'nope' }),
    (err) => err.details.email === 'Некорректный формат'
  );
});
