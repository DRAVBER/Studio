import { badRequest } from './http.js';

export function validate(schema, input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw badRequest('Ожидается JSON-объект');
  const errors = {};
  const out = {};
  for (const [key, rules] of Object.entries(schema)) {
    const raw = input[key];
    const val = typeof raw === 'string' ? raw.trim() : raw;
    const empty = val === undefined || val === null || val === '';
    if (rules.required && empty) { errors[key] = 'Обязательное поле'; continue; }
    if (empty) continue;
    const type = Array.isArray(val) ? 'array' : typeof val;
    const types = Array.isArray(rules.type) ? rules.type : [rules.type || 'string'];
    if (!types.includes(type)) { errors[key] = 'Некорректный тип данных'; continue; }
    if (type === 'array' && (val.length > 20 || val.some(item => typeof item !== 'string' || !item.trim() || item.trim().length > 40))) {
      errors[key] = 'Не более 20 текстовых тегов, до 40 символов каждый'; continue;
    }
    const str = type === 'array' ? val.join(',') : String(val);
    if (rules.min != null && str.length < rules.min) { errors[key] = `Минимум ${rules.min} символов`; continue; }
    if (rules.max != null && str.length > rules.max) { errors[key] = `Максимум ${rules.max} символов`; continue; }
    if (rules.pattern && !rules.pattern.test(str)) { errors[key] = rules.message || 'Некорректный формат'; continue; }
    if (rules.enum && !rules.enum.includes(val)) { errors[key] = 'Недопустимое значение'; continue; }
    if (rules.check && !rules.check(val)) { errors[key] = rules.message || 'Некорректный формат'; continue; }
    out[key] = val;
  }
  if (Object.keys(errors).length) throw badRequest('Ошибка валидации', errors);
  return out;
}
