export default function AvatarInitial({ username, size = 40, accent = false }) {
  const letter = (username?.[0] || '?').toUpperCase();
  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded-full border uppercase font-semibold select-none',
        accent
          ? 'bg-black text-white border-black'
          : 'bg-neutral-100 text-neutral-900 border-neutral-300',
      ].join(' ')}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}
      aria-hidden="true"
    >
      {letter}
    </span>
  );
}
