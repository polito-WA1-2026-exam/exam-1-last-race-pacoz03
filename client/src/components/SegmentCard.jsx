import { effectLabel, effectColor } from '../utils/effect.js';

export default function SegmentCard({ step }) {
  return (
    <article className="w-full max-w-[28rem] bg-white border border-neutral-300 p-4 flex flex-col gap-2">
      <span className="text-xs uppercase text-neutral-500 tracking-widest">Current segment</span>
      <div className="text-2xl font-semibold uppercase">
        {step.from} <span className="text-neutral-400 mx-1">→</span> {step.to}
      </div>
      <div className="pt-2 border-t border-neutral-200 flex flex-col gap-1">
        <span className="text-xs uppercase text-neutral-500">Event</span>
        <div className="bg-neutral-50 p-2 border border-neutral-200 flex items-center gap-2">
          <div className="flex-grow">
            <p className="font-medium">{step.event}</p>
            <p className={['text-xs mt-1', effectColor(step.effect)].join(' ')}>
              {effectLabel(step.effect)} {Math.abs(step.effect) === 1 ? 'coin' : 'coins'}
            </p>
          </div>
          <span className={['text-2xl font-semibold tabular-nums', effectColor(step.effect)].join(' ')}>
            {effectLabel(step.effect)}
          </span>
        </div>
      </div>
    </article>
  );
}
