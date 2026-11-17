import { useState } from 'react';
import { api } from '../api/client.js';

export function AdminLogin({ onSuccess }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token, expiresIn } = await api.auth.login(login, password);
      onSuccess(token, expiresIn);
    } catch (err) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-brand">
        <span className="preloader-mark" />
        STUDIO · ADMIN
      </div>
      <form className="admin-login-form" onSubmit={submit}>
        <h2>Вход в админку</h2>
        <div className="field">
          <label htmlFor="admin-login">Логин</label>
          <input id="admin-login" value={login} onChange={(e) => setLogin(e.target.value)}
                 autoComplete="username" autoFocus />
        </div>
        <div className="field">
          <label htmlFor="admin-pass">Пароль</label>
          <input id="admin-pass" type="password" value={password}
                 onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button type="submit" className="btn btn-solid" disabled={submitting}>
          {submitting ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}