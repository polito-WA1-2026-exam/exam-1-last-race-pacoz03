import { useState } from 'react';

const INITIAL_COINS = 20;

function effectLabel(effect) {
  if (effect === 0) return '±0';
  return effect > 0 ? `+${effect}` : String(effect);
}

function effectColor(effect) {
  if (effect > 0) return 'text-green-700';
  if (effect < 0) return 'text-red-600';
  return 'text-neutral-500';
}

export default function ExecutionView({ game, result, onFinish }) {
  const valid = result.valid;
  const steps = result.steps || [];
  const [revealedIdx, setRevealedIdx] = useState(0);

  if (!valid) {
    return (
      <main className="flex-grow w-full max-w-[28rem] mx-auto px-4 py-10 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs uppercase tracking-widest border border-red-600 text-red-600 px-2 py-1">
            Viaggio annullato
          </span>
          <h1 className="text-2xl font-semibold uppercase">Percorso non valido</h1>
        </div>

        <div className="bg-red-50 border border-red-300 p-4 flex flex-col gap-2">
          <div className="text-lg font-semibold uppercase text-red-700">Verifica fallita</div>
          <p className="text-red-700 break-words">
            {result.reason || 'Il percorso non rispetta le regole della rete.'}
          </p>
          <p className="text-xs uppercase text-red-700">
            Punteggio finale: <span className="tabular-nums">0</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => onFinish({ valid: false, finalScore: 0, reason: result.reason })}
          className="w-full bg-black text-white uppercase py-4 hover:bg-neutral-800 transition-colors"
        >
          Vedi risultato
        </button>
      </main>
    );
  }

  const total = steps.length;
  const current = steps[revealedIdx];
  const isLast = revealedIdx === total - 1;
  const coinsNow = current.total;
  const progressPct = ((revealedIdx + 1) / total) * 100;

  function handleNext() {
    if (isLast) {
      onFinish({ valid: true, finalScore: result.finalScore, steps });
      return;
    }
    setRevealedIdx((i) => Math.min(i + 1, total - 1));
  }

  return (
    <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-6 flex flex-col items-center gap-6">
      <div className="w-full max-w-[28rem] flex items-center justify-between bg-neutral-100 border border-neutral-300 px-4 py-2">
        <div className="flex flex-col">
          <span className="text-xs uppercase text-neutral-500">Monete</span>
          <span className="text-3xl font-semibold tabular-nums leading-none">{coinsNow}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs uppercase text-neutral-500">Partenza</span>
          <span className="text-xs uppercase tabular-nums">{INITIAL_COINS}</span>
        </div>
        <div className={['text-3xl font-semibold tabular-nums', effectColor(current.effect)].join(' ')} aria-live="polite">
          {effectLabel(current.effect)}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs uppercase tracking-widest border border-black px-2 py-1">In viaggio</span>
        <h1 className="text-3xl font-bold uppercase text-center">
          Tratta {String(revealedIdx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </h1>
      </div>

      <article className="w-full max-w-[28rem] bg-white border border-neutral-300 p-4 flex flex-col gap-2">
        <span className="text-xs uppercase text-neutral-500 tracking-widest">Tratta attuale</span>
        <div className="text-2xl font-semibold uppercase">
          {current.from} <span className="text-neutral-400 mx-1">→</span> {current.to}
        </div>
        <div className="pt-2 border-t border-neutral-200 flex flex-col gap-1">
          <span className="text-xs uppercase text-neutral-500">Evento</span>
          <div className="bg-neutral-50 p-2 border border-neutral-200 flex items-center gap-2">
            <div className="flex-grow">
              <p className="font-medium">{current.event}</p>
              <p className={['text-xs mt-1', effectColor(current.effect)].join(' ')}>
                {effectLabel(current.effect)} {Math.abs(current.effect) === 1 ? 'moneta' : 'monete'}
              </p>
            </div>
            <span className={['text-2xl font-semibold tabular-nums', effectColor(current.effect)].join(' ')}>
              {effectLabel(current.effect)}
            </span>
          </div>
        </div>
      </article>

      <div className="w-full max-w-[28rem]">
        <div className="text-xs text-neutral-500 mb-2 flex justify-between uppercase tracking-widest">
          <span>{game.start.name}</span>
          <span>{game.destination.name}</span>
        </div>
        <div className="w-full relative flex items-center h-4">
          <div className="w-full h-1 bg-neutral-200 absolute" aria-hidden="true" />
          <div className="h-1 bg-black absolute" style={{ width: `${progressPct}%` }} aria-hidden="true" />
          {steps.map((_, i) => {
            const left = `${(i / total) * 100}%`;
            const reached = i <= revealedIdx;
            return (
              <span
                key={i}
                className={[
                  'w-3 h-3 border-2 border-white rounded-full z-10 absolute -translate-x-1/2',
                  reached ? 'bg-black' : 'bg-white border-neutral-400',
                ].join(' ')}
                style={{ left }}
                aria-hidden="true"
              />
            );
          })}
          <span className="w-4 h-4 border-2 border-white rounded-full z-10 absolute right-0 bg-red-600" aria-hidden="true" />
        </div>
        <p className="mt-2 text-xs uppercase text-neutral-500 text-center">
          Tratta {revealedIdx + 1} di {total}
        </p>
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="w-full max-w-[28rem] bg-black text-white uppercase py-4 hover:bg-neutral-800 transition-colors"
      >
        {isLast ? 'Vedi risultato' : 'Prossima fermata'}
      </button>
    </main>
  );
}
