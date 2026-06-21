import { effectLabel, effectColor } from '../utils/effect.js';

export default function CoinCounter({ coins, initial, effect }) {
  return (
    <div className="w-full max-w-[28rem] flex items-center justify-between bg-neutral-100 border border-neutral-300 px-4 py-2">
      <div className="flex flex-col">
        <span className="text-xs uppercase text-neutral-500">Coins</span>
        <span className="text-3xl font-semibold tabular-nums leading-none">{coins}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-xs uppercase text-neutral-500">Starting</span>
        <span className="text-xs uppercase tabular-nums">{initial}</span>
      </div>
      <div className={['text-3xl font-semibold tabular-nums', effectColor(effect)].join(' ')} aria-live="polite">
        {effectLabel(effect)}
      </div>
    </div>
  );
}
