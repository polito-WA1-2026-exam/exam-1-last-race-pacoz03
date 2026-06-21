import AvatarInitial from './AvatarInitial.jsx';

export default function PodiumCard({ entry, place }) {
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
            You
          </span>
        )}
        <span className="text-xs uppercase text-neutral-500">Position</span>
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
        <div className="text-xs uppercase text-neutral-500">Coins</div>
      </div>
    </div>
  );
}
