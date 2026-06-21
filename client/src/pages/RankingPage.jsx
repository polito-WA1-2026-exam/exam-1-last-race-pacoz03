import { useEffect, useState } from 'react';
import API from '../api/API.js';
import PodiumCard from '../components/PodiumCard.jsx';
import RankingRow from '../components/RankingRow.jsx';

export default function RankingPage() {
  const [ranking, setRanking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await API.getRanking();
        if (!cancelled) setRanking(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load ranking.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-10 flex flex-col gap-10">
      <header className="flex flex-col gap-2 border-b border-neutral-200 pb-4">
        <h1 className="text-4xl font-bold uppercase tracking-tight">Ranking</h1>
        <p className="text-neutral-600">
          Best score per user, in descending order.
        </p>
      </header>

      {error && (
        <div role="alert" className="border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-xs uppercase">
          {error}
        </div>
      )}

      {!ranking ? (
        <p className="text-neutral-600">Loading ranking…</p>
      ) : ranking.length === 0 ? (
        <p className="text-neutral-600">No games recorded.</p>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-6">
            <PodiumCard place={2} entry={ranking[1]} />
            <PodiumCard place={1} entry={ranking[0]} />
            <PodiumCard place={3} entry={ranking[2]} />
          </section>

          <section className="bg-white border border-neutral-200 overflow-hidden">
            <div className="grid grid-cols-[80px_1fr_180px] md:grid-cols-[100px_1fr_240px] border-b border-neutral-200 bg-neutral-50 p-4">
              <div className="text-xs uppercase text-neutral-500">Pos</div>
              <div className="text-xs uppercase text-neutral-500">User</div>
              <div className="text-xs uppercase text-neutral-500 text-right">Coins</div>
            </div>
            <ul className="flex flex-col">
              {ranking.map((r) => (
                <RankingRow key={r.userId} entry={r} />
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
