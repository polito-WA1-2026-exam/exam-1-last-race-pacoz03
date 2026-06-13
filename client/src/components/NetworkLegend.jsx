export default function NetworkLegend({ lines }) {
  return (
    <ul className="flex flex-wrap gap-4 mt-4 text-xs uppercase">
      {lines.map((l) => (
        <li key={l.id} className="flex items-center gap-2">
          <span
            className="inline-block w-6 h-2"
            style={{ backgroundColor: l.color }}
            aria-hidden="true"
          />
          Linea {l.name}
        </li>
      ))}
      <li className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 border-2 border-black bg-white" aria-hidden="true" />
        Interscambio
      </li>
    </ul>
  );
}
