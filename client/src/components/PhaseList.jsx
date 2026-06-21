export default function PhaseList({ phases }) {
  return (
    <div className="flex flex-col gap-4">
      {phases.map((p) => (
        <article
          key={p.n}
          className="bg-white border border-neutral-200 p-4 flex gap-4 items-start"
        >
          <div
            className="w-12 h-12 bg-black text-white flex items-center justify-center text-xl font-bold flex-shrink-0"
            aria-hidden="true"
          >
            {p.n}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold uppercase">{p.title}</h3>
            <p className="text-neutral-600">{p.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
