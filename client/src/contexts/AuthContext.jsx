import { useCallback, useEffect, useState } from 'react';
import API from '../api/API.js';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const h = await API.getHealth();
        if (cancelled) return;
        if (h?.authenticated) {
          const u = await API.getCurrentUser();
          if (!cancelled) setUser(u);
        }
      } catch (err) {
        if (!cancelled) console.warn('Bootstrap sessione fallito:', err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (username, password) => {
    const u = await API.login(username, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await API.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
