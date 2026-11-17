export class HttpError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest   = (msg, details) => new HttpError(400, msg, details);
export const unauthorized = (msg = 'Требуется авторизация') => new HttpError(401, msg);
export const notFound     = (msg = 'Не найдено') => new HttpError(404, msg);

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);