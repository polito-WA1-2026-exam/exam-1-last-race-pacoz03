import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth.js';
import NetworkLegend from '../components/NetworkLegend.jsx';
import PhaseList from '../components/PhaseList.jsx';

const LINES = [
  { id: 1, name: 'Red',    color: '#E2231A' },
  { id: 2, name: 'Blue',   color: '#0057B8' },
  { id: 3, name: 'Green',  color: '#00843D' },
  { id: 4, name: 'Yellow', color: '#FFC20E' },
];

const PHASES = [
  {
    n: 1,
    title: 'Setup',
    text: 'Study the full network map: 4 lines, 14 stations, 4 interchanges. When you start a game you receive a random start/destination pair at least 3 segments apart.',
  },
  {
    n: 2,
    title: 'Planning',
    text: 'You have 90 seconds to build a valid route: a contiguous sequence of segments from start to destination, without reusing the same segment and changing line only at interchange stations.',
  },
  {
    n: 3,
    title: 'Execution',
    text: 'You start with 20 coins. For each segment of your route the server draws a random event with an effect from −4 to +4 and updates your balance. This phase has no timer.',
  },
  {
    n: 4,
    title: 'Result',
    text: 'Your score is the final coin balance. An invalid or incomplete route scores 0; negative balances are stored as 0. The ranking keeps your personal best.',
  },
];

const RULES = [
  { label: 'You start with',  value: '20 coins'    },
  { label: 'Planning timer',  value: '90 seconds'  },
  { label: 'Events per segment', value: '−4 to +4' },
  { label: 'Minimum distance', value: '3 segments' },
];

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <main className="flex-grow w-full max-w-[720px] mx-auto px-6 py-10 flex flex-col gap-10">
      <section className="flex flex-col gap-4 text-center py-10 border-b border-neutral-200">
        <h1 className="text-4xl font-bold uppercase tracking-tight">
          Last Race
        </h1>
        <p className="text-lg text-neutral-600 max-w-prose mx-auto">
          Plan the route. Weigh the events. Reach your destination with the highest score.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold uppercase tracking-tight border-b border-neutral-200 pb-2">
          Game phases
        </h2>
        <PhaseList phases={PHASES} />
      </section>

      {user && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold uppercase border-b border-neutral-200 pb-2">The network</h2>
          <NetworkLegend lines={LINES} />
        </section>
      )}

      <section className="bg-neutral-50 border-l-4 border-black p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold uppercase">Key rules</h2>
        <ul className="flex flex-col gap-2 text-xs">
          {RULES.map((r) => (
            <li key={r.label} className="flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 bg-black rounded-full" aria-hidden="true" />
              <span className="uppercase">{r.label}</span>
              <span className="bg-white px-2 py-1 border border-neutral-200 uppercase">
                {r.value}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 mb-10">
        <div className="bg-white border border-neutral-200 flex flex-col sm:flex-row">
          <div className="p-6 flex-grow flex flex-col justify-center gap-2">
            {loading ? (
              <h2 className="text-2xl font-semibold uppercase tracking-tight">
                Loading session…
              </h2>
            ) : user ? (
              <>
                <h2 className="text-2xl font-semibold uppercase tracking-tight">
                  Welcome back, {user.displayName}
                </h2>
                <p className="text-neutral-600">
                  The network is ready: choose to play now or check the ranking.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold uppercase tracking-tight">
                  Sign in to play
                </h2>
                <p className="text-neutral-600">
                  The anonymous view shows instructions only. Sign in to receive a start and destination.
                </p>
              </>
            )}
          </div>
          <div className="p-6 sm:w-72 flex flex-col items-stretch justify-center gap-2 bg-neutral-50 border-t sm:border-t-0 sm:border-l border-neutral-200">
            {user ? (
              <>
                <Link
                  to="/play"
                  className="bg-black text-white px-6 py-3 text-center uppercase no-underline hover:bg-neutral-800 transition-colors"
                >
                  Start game
                </Link>
                <Link
                  to="/ranking"
                  className="border border-black px-6 py-3 text-center uppercase no-underline hover:bg-neutral-100 transition-colors"
                >
                  Ranking
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-black text-white px-6 py-3 text-center uppercase no-underline hover:bg-neutral-800 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
