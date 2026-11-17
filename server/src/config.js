import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 4000,
  env: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  trustProxy: process.env.TRUST_PROXY && process.env.TRUST_PROXY !== 'false' && process.env.TRUST_PROXY !== '0'
    ? (/^\d+$/.test(process.env.TRUST_PROXY) ? Number(process.env.TRUST_PROXY) : process.env.TRUST_PROXY)
    : false,
  adminLogin: process.env.ADMIN_LOGIN || '123',
  adminPassword: process.env.ADMIN_PASSWORD || '123',
};