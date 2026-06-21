const VIEWBOX = '0 0 900 780';
const NODE_R = 9;
const INTER_HALF = 11;

export default function NetworkMap({
  network,
  variant = 'full',
  startId = null,
  destId = null,
}) {
  const { stations, segments, lines = [] } = network;
  const stationsById = new Map(stations.map((s) => [s.id, s]));
  const lineColor = new Map(lines.map((l) => [l.id, l.color]));

  return (
    <svg
      viewBox={VIEWBOX}
      role="img"
      aria-label="Metro network map"
      className="block w-full h-auto bg-white"
    >
      {variant === 'full' && segments.map((seg) => {
        const a = stationsById.get(seg.a);
        const b = stationsById.get(seg.b);
        if (!a || !b) return null;
        return (
          <line
            key={seg.id}
            x1={a.x} y1={a.y}
            x2={b.x} y2={b.y}
            stroke={lineColor.get(seg.lineId) || '#1A1A1A'}
            strokeWidth="6"
            strokeLinecap="round"
          />
        );
      })}

      {stations.map((s) => {
        const isStart = s.id === startId;
        const isDest = s.id === destId;
        const stroke = isStart ? '#00843D' : isDest ? '#E2231A' : '#1A1A1A';
        const strokeW = isStart || isDest ? 4 : 2;

        return (
          <g key={s.id}>
            {s.interchange ? (
              <rect
                x={s.x - INTER_HALF} y={s.y - INTER_HALF}
                width={INTER_HALF * 2} height={INTER_HALF * 2}
                fill="#FFFFFF" stroke={stroke} strokeWidth={strokeW}
              />
            ) : (
              <circle
                cx={s.x} cy={s.y} r={NODE_R}
                fill="#FFFFFF" stroke={stroke} strokeWidth={strokeW}
              />
            )}
            <text
              x={s.x}
              y={s.y - (s.interchange ? INTER_HALF : NODE_R) - 6}
              textAnchor="middle"
              fontFamily='"Archivo Narrow", system-ui, sans-serif'
              fontSize="14"
              fontWeight="600"
              fill="#1A1A1A"
            >
              {s.name}
            </text>
            {(isStart || isDest) && (
              <text
                x={s.x}
                y={s.y + (s.interchange ? INTER_HALF : NODE_R) + 14}
                textAnchor="middle"
                fontFamily='"JetBrains Mono", ui-monospace, monospace'
                fontSize="11"
                fontWeight="700"
                fill={stroke}
              >
                {isStart ? 'START' : 'END'}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
