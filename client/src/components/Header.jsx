import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth.js';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-neutral-200 w-full sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-6 py-3 max-w-7xl mx-auto">
        <Link
          to="/"
          className="text-xl font-bold uppercase tracking-tight no-underline"
        >
          Last Race
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-xs uppercase text-neutral-600">
                {user.displayName}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="border border-black px-5 py-2 uppercase text-sm hover:bg-neutral-100 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-black text-white px-6 py-3 uppercase text-sm no-underline hover:bg-neutral-800 transition-colors"
            >
              Accedi
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
