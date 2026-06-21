export default function ProgressRail({ steps, revealedIdx, startName, destName }) {
  const total = steps.length;
  const progressPct = ((revealedIdx + 1) / total) * 100;

  return (
    <div className="w-full max-w-[28rem]">
      <div className="text-xs text-neutral-500 mb-2 flex justify-between uppercase tracking-widest">
        <span>{startName}</span>
        <span>{destName}</span>
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
        Segment {revealedIdx + 1} of {total}
      </p>
    </div>
  );
}
