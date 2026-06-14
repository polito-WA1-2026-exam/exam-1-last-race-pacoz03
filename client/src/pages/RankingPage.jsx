import { useEffect, useState } from 'react';
import API from '../api/API.js';
import AvatarInitial from '../components/AvatarInitial.jsx';

function PodiumCard({ entry, place }) {
  if (!entry) return <div className="hidden md:block" aria-hidden="true" />;
  const isLeader = place === 1;
  const orderClass = place === 1
    ? 'order-1 md:order-2 md:-translate-y-4 md:z-10'
    : place === 2
      ? 'order-2 md:order-1'
      : 'order-3 md:order-3';

  return (
    <div className={['flex flex-col items-center', orderClass].join(' ')}>
      <div
        className={[
          'bg-white border w-full max-w-[320px] flex flex-col items-center gap-4 relative',
          isLeader ? 'border-black p-6 pb-8' : 'border-neutral-300 p-4 pb-6',
        ].join(' ')}
      >
        {entry.isMe && (
          <span className="absolute top-0 left-0 bg-white text-black border border-black px-2 py-1 text-[10px] uppercase tracking-widest">
            Tu
          </span>
        )}
        <span className="text-xs uppercase text-neutral-500">Posizione</span>
        <div className={['font-bold tabular-nums', isLeader ? 'text-6xl' : 'text-5xl'].join(' ')}>
          {String(place).padStart(2, '0')}
        </div>
        <div className="w-full border-t border-dashed border-neutral-300 my-2" />
        <AvatarInitial username={entry.username} size={isLeader ? 80 : 64} accent={entry.isMe} />
        <div className={['uppercase text-center font-semibold', isLeader ? 'text-2xl' : 'text-lg'].join(' ')}>
          {entry.displayName}
        </div>
        <div className={['font-bold tabular-nums mt-2', isLeader ? 'text-5xl' : 'text-4xl'].join(' ')}>
          {entry.best}
        </div>
        <div className="text-xs uppercase text-neutral-500">Monete</div>
      </div>
    </div>
  );
}

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
        if (!cancelled) setError(err.message || 'Caricamento classifica fallito.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-10 flex flex-col gap-10">
      <header className="flex flex-col gap-2 border-b border-neutral-200 pb-4">
        <h1 className="text-4xl font-bold uppercase tracking-tight">Classifica</h1>
        <p className="text-neutral-600">
          Miglior punteggio per ciascun utente, in ordine decrescente.
        </p>
      </header>

      {error && (
        <div role="alert" className="border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-xs uppercase">
          {error}
        </div>
      )}

      {!ranking ? (
        <p className="text-neutral-600">Caricamento classifica…</p>
      ) : ranking.length === 0 ? (
        <p className="text-neutral-600">Nessuna partita registrata.</p>
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
              <div className="text-xs uppercase text-neutral-500">Utente</div>
              <div className="text-xs uppercase text-neutral-500 text-right">Monete</div>
            </div>
            <ul className="flex flex-col">
              {ranking.map((r) => (
                <li
                  key={r.userId}
                  className={[
                    'grid grid-cols-[80px_1fr_180px] md:grid-cols-[100px_1fr_240px] border-b border-neutral-200 p-4 items-center transition-colors',
                    r.isMe ? 'bg-neutral-100' : 'hover:bg-neutral-50',
                  ].join(' ')}
                >
                  <div className="text-xl font-semibold tabular-nums">
                    {String(r.rank).padStart(2, '0')}
                  </div>
                  <div className="flex items-center gap-4 min-w-0">
                    <AvatarInitial username={r.username} size={36} accent={r.isMe} />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="uppercase font-semibold truncate">{r.displayName}</span>
                        {r.isMe && (
                          <span className="text-[10px] uppercase tracking-widest bg-black text-white px-1 py-[2px]">
                            Tu
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-500 lowercase truncate">
                        @{r.username}
                        {r.gamesPlayed > 0 ? ` — ${r.gamesPlayed} ${r.gamesPlayed === 1 ? 'partita' : 'partite'}` : ' — nessuna partita'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xl font-semibold tabular-nums">
                    {r.best}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
