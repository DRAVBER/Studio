const KEY = 'studio-admin-token';
const EXPIRY = 'studio-admin-expiry';
export function getToken() {
  try {
    const expiry = Number(sessionStorage.getItem(EXPIRY));
    if (expiry && Date.now() >= expiry) { clearToken(); return null; }
    return sessionStorage.getItem(KEY);
  } catch { return null; }
}
export function setToken(token, expiresIn) {
  try {
    sessionStorage.setItem(KEY, token);
    if (expiresIn) sessionStorage.setItem(EXPIRY, String(Date.now() + expiresIn));
    else sessionStorage.removeItem(EXPIRY);
  } catch {}
}
export function clearToken() {
  try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(EXPIRY); } catch {}
}
export function expireSession() {
  clearToken();
  window.dispatchEvent(new Event('auth-expired'));
}
