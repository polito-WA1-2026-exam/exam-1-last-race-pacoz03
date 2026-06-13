import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth.js';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '', form: '' });
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to={from} replace />;

  function validate() {
    const next = { username: '', password: '', form: '' };
    if (!username.trim()) next.username = 'Username obbligatorio.';
    if (!password) next.password = 'Password obbligatoria.';
    setErrors(next);
    return !next.username && !next.password;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.status === 401
        ? 'Credenziali non valide.'
        : (err.message || 'Errore durante l\'accesso.');
      setErrors((p) => ({ ...p, form: msg }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] bg-white border border-neutral-200 rounded-lg shadow-sm">
        <header className="p-6 pb-8 flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-bold tracking-tight uppercase mb-2">Last Race</h1>
          <div className="text-xs uppercase text-neutral-500">Accesso al sistema</div>
        </header>

        <section className="p-6 pt-2">
          <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="text-xs uppercase text-neutral-600">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                className="border border-neutral-300 rounded px-3 py-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? 'username-err' : undefined}
                disabled={submitting}
              />
              {errors.username && (
                <p id="username-err" className="text-xs text-red-600 uppercase">
                  {errors.username}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs uppercase text-neutral-600">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="border border-neutral-300 rounded px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-err' : undefined}
                disabled={submitting}
              />
              {errors.password && (
                <p id="password-err" className="text-xs text-red-600 uppercase">
                  {errors.password}
                </p>
              )}
            </div>

            {errors.form && (
              <div role="alert" className="border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-xs uppercase">
                {errors.form}
              </div>
            )}

            <button
              type="submit"
              className="bg-black text-white py-2 uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Accesso in corso…' : 'Accedi'}
            </button>

            <div className="pt-2 border-t border-neutral-200 text-center text-xs uppercase text-neutral-500">
              <Link to="/" className="hover:text-black transition-colors">
                Torna alle istruzioni
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
