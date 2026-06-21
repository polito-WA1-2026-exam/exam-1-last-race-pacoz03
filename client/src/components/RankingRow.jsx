import AvatarInitial from './AvatarInitial.jsx';

export default function RankingRow({ entry: r }) {
  return (
    <li
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
                You
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-500 lowercase truncate">
            @{r.username}
            {r.gamesPlayed > 0 ? ` — ${r.gamesPlayed} ${r.gamesPlayed === 1 ? 'game' : 'games'}` : ' — no games'}
          </span>
        </div>
      </div>
      <div className="text-right text-xl font-semibold tabular-nums">
        {r.best}
      </div>
    </li>
  );
}
