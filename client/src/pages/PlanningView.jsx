import { useRef, useMemo, useState } from 'react';
import API from '../api/API.js';
import NetworkMap from '../components/NetworkMap.jsx';
import useCountdown from '../hooks/useCountdown.js';

const PLANNING_SECONDS = 90;

function formatMMSS(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function buildStationChain(startName, usedSegments) {
  const chain = [startName];
  for (const seg of usedSegments) {
    const tail = chain[chain.length - 1];
    chain.push(seg.a === tail ? seg.b : seg.a);
  }
  return chain;
}

export default function PlanningView({ network, game, onSubmitted }) {
  const startName = game.start.name;
  const destName = game.destination.name;
  const segments = game.segments;

  const [used, setUsed] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const submittedRef = useRef(false);

  const chain = useMemo(() => buildStationChain(startName, used), [startName, used]);
  const tail = chain[chain.length - 1];

  function segKey(s) {
    const [x, y] = [s.a, s.b].sort();
    return `${x}|${y}`;
  }

  function isSegmentUsed(s) {
    const target = segKey(s);
    return used.some((u) => segKey(u) === target);
  }

  function isSegmentSelectable(s) {
    if (isSegmentUsed(s)) return false;
    return s.a === tail || s.b === tail;
  }

  function addSegment(s) {
    if (!isSegmentSelectable(s)) return;
    const oriented = s.a === tail ? { a: s.a, b: s.b } : { a: s.b, b: s.a };
    setUsed((prev) => [...prev, oriented]);
  }

  function removeLast() {
    setUsed((prev) => prev.slice(0, -1));
  }

  function resetPath() {
    setUsed([]);
  }

  async function submit(routeToSend) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    try {
      const result = await API.submitRoute(game.gameId, routeToSend);
      onSubmitted?.({ result, route: routeToSend });
    } catch (err) {
      submittedRef.current = false;
      setSubmitError(err.message || 'Invio percorso fallito.');
    }
  }

  function handleConfirm() {
    submit(chain);
  }

  const secondsLeft = useCountdown(PLANNING_SECONDS);
  const lowTime = secondsLeft <= 15;

  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-4 flex flex-col gap-4">
      <section className="sticky top-0 z-30 bg-white py-4 border-b border-neutral-200 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex items-end gap-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase text-neutral-500 mb-1">Tempo rimanente</span>
            <div
              className={[
                'text-4xl font-mono px-2 border tabular-nums',
                lowTime ? 'bg-red-600 text-white border-red-600' : 'bg-white border-neutral-300',
              ].join(' ')}
              aria-live="polite"
            >
              {formatMMSS(secondsLeft)}
            </div>
          </div>
          <div className="flex flex-col border-l border-neutral-200 pl-4">
            <span className="text-xs uppercase text-neutral-500 mb-1">Segmenti scelti</span>
            <div className="text-4xl font-mono px-2 tabular-nums bg-neutral-100 border border-neutral-300">
              {String(used.length).padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 flex items-stretch">
          <div className="p-4 flex flex-col justify-center min-w-[160px]">
            <span className="text-xs uppercase text-neutral-500 tracking-widest">Partenza</span>
            <span className="text-xl font-semibold uppercase mt-1 text-green-700">{startName}</span>
          </div>
          <div className="border-l border-dashed border-neutral-300" aria-hidden="true" />
          <div className="px-4 flex items-center justify-center text-neutral-400 text-xl">→</div>
          <div className="p-4 flex flex-col justify-center min-w-[160px] bg-neutral-50">
            <span className="text-xs uppercase text-neutral-500 tracking-widest">Destinazione</span>
            <span className="text-xl font-semibold uppercase mt-1 text-red-600">{destName}</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 border border-neutral-200 bg-white flex flex-col">
          <div className="border-b border-neutral-200 px-4 py-2 flex justify-between items-center">
            <span className="text-xs uppercase">Rete — Vista nodi</span>
            <span className="text-xs uppercase text-neutral-500">
              Stazione corrente: <strong className="text-neutral-900">{tail}</strong>
            </span>
          </div>
          <div className="p-4">
            <NetworkMap
              network={network}
              variant="nodes"
              startId={game.start.id}
              destId={game.destination.id}
            />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="flex flex-col">
            <div className="border-b-2 border-black pb-1 mb-1">
              <h2 className="text-lg font-semibold uppercase">Segmenti disponibili</h2>
            </div>
            <ul className="max-h-[420px] overflow-y-auto border border-neutral-200 bg-white divide-y divide-neutral-200">
              {segments.map((seg) => {
                const usedFlag = isSegmentUsed(seg);
                const selectable = isSegmentSelectable(seg);
                return (
                  <li key={`${seg.a}|${seg.b}`}>
                    <button
                      type="button"
                      onClick={() => addSegment(seg)}
                      disabled={!selectable}
                      className={[
                        'w-full p-2 flex justify-between items-center text-left text-xs uppercase transition-colors',
                        usedFlag
                          ? 'bg-neutral-100 line-through text-neutral-500 cursor-not-allowed'
                          : selectable
                            ? 'hover:bg-neutral-50 cursor-pointer'
                            : 'opacity-50 cursor-not-allowed',
                      ].join(' ')}
                    >
                      <span>{seg.a} — {seg.b}</span>
                      <span aria-hidden="true">{usedFlag ? '✓' : selectable ? '+' : ''}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border border-neutral-200 bg-neutral-50 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase text-neutral-500 tracking-widest">
                Percorso in costruzione
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={removeLast}
                  disabled={used.length === 0}
                  className="text-xs uppercase border border-neutral-300 px-2 py-[2px] disabled:opacity-40 hover:bg-white"
                >
                  ← Rimuovi ultimo
                </button>
                <button
                  type="button"
                  onClick={resetPath}
                  disabled={used.length === 0}
                  className="text-xs uppercase border border-neutral-300 px-2 py-[2px] disabled:opacity-40 hover:bg-white"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {chain.map((name, idx) => {
                const isStart = idx === 0;
                const isDest = name === destName && idx > 0;
                return (
                  <span key={`${name}-${idx}`} className="flex items-center gap-1">
                    {idx > 0 && <span className="text-neutral-400" aria-hidden="true">→</span>}
                    <span
                      className={[
                        'border px-2 py-1 text-xs uppercase bg-white',
                        isStart
                          ? 'border-green-700 text-green-700'
                          : isDest
                            ? 'border-red-600 text-red-600'
                            : 'border-neutral-300',
                      ].join(' ')}
                    >
                      {name}
                    </span>
                  </span>
                );
              })}
              {chain.length === 1 && (
                <span className="border border-dashed border-neutral-400 px-2 py-1 text-xs uppercase text-neutral-500 italic">
                  Seleziona una tratta…
                </span>
              )}
            </div>
            <div className="text-xs uppercase text-neutral-500">
              Stazione corrente: <strong className="text-neutral-900">{tail}</strong>
              {tail === destName && used.length > 0 && (
                <span className="ml-2 text-green-700">— hai raggiunto la destinazione</span>
              )}
            </div>
          </div>

          {submitError && (
            <div role="alert" className="border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-xs uppercase">
              {submitError}
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="bg-black text-white text-lg uppercase py-4 w-full border border-black hover:bg-neutral-800 transition-colors"
          >
            Conferma percorso
          </button>
        </div>
      </section>
    </main>
  );
}
