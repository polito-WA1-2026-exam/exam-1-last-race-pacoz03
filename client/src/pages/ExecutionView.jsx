import { useState } from 'react';
import CoinCounter from '../components/CoinCounter.jsx';
import SegmentCard from '../components/SegmentCard.jsx';
import ProgressRail from '../components/ProgressRail.jsx';

const INITIAL_COINS = 20;

export default function ExecutionView({ game, result, onFinish }) {
  const valid = result.valid;
  const steps = result.steps || [];
  const [revealedIdx, setRevealedIdx] = useState(0);

  if (!valid) {
    return (
      <main className="flex-grow w-full max-w-[28rem] mx-auto px-4 py-10 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs uppercase tracking-widest border border-red-600 text-red-600 px-2 py-1">
            Journey cancelled
          </span>
          <h1 className="text-2xl font-semibold uppercase">Invalid route</h1>
        </div>

        <div className="bg-red-50 border border-red-300 p-4 flex flex-col gap-2">
          <div className="text-lg font-semibold uppercase text-red-700">Validation failed</div>
          <p className="text-red-700 break-words">
            {result.reason || 'The route does not follow the network rules.'}
          </p>
          <p className="text-xs uppercase text-red-700">
            Final score: <span className="tabular-nums">0</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => onFinish({ valid: false, finalScore: 0, reason: result.reason })}
          className="w-full bg-black text-white uppercase py-4 hover:bg-neutral-800 transition-colors"
        >
          See result
        </button>
      </main>
    );
  }

  const total = steps.length;
  const current = steps[revealedIdx];
  const isLast = revealedIdx === total - 1;

  function handleNext() {
    if (isLast) {
      onFinish({ valid: true, finalScore: result.finalScore, steps });
      return;
    }
    setRevealedIdx((i) => Math.min(i + 1, total - 1));
  }

  return (
    <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-6 flex flex-col items-center gap-6">
      <CoinCounter coins={current.total} initial={INITIAL_COINS} effect={current.effect} />

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs uppercase tracking-widest border border-black px-2 py-1">Travelling</span>
        <h1 className="text-3xl font-bold uppercase text-center">
          Segment {String(revealedIdx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </h1>
      </div>

      <SegmentCard step={current} />

      <ProgressRail
        steps={steps}
        revealedIdx={revealedIdx}
        startName={game.start.name}
        destName={game.destination.name}
      />

      <button
        type="button"
        onClick={handleNext}
        className="w-full max-w-[28rem] bg-black text-white uppercase py-4 hover:bg-neutral-800 transition-colors"
      >
        {isLast ? 'See result' : 'Next stop'}
      </button>
    </main>
  );
}
