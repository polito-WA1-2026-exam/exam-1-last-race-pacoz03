import db from '../db/db.js';

const selectSegmentsWithNames = db.prepare(`
  SELECT s.id AS segmentId, s.line_id AS lineId,
         sa.name AS a, sb.name AS b
  FROM segments s
  JOIN stations sa ON sa.id = s.station_a
  JOIN stations sb ON sb.id = s.station_b
`);
const selectStations = db.prepare(
  'SELECT name, is_interchange AS interchange FROM stations'
);
const selectStationById = db.prepare(
  'SELECT name FROM stations WHERE id = ?'
);

function keyPair(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function validateRoute(route, game) {
  if (!Array.isArray(route) || route.length < 2) {
    return { valid: false, reason: 'Route is empty or too short.' };
  }

  const startName = selectStationById.get(game.start_id)?.name;
  const destName = selectStationById.get(game.dest_id)?.name;
  if (!startName || !destName) {
    return { valid: false, reason: 'Malformed game.' };
  }
  if (route[0] !== startName) {
    return { valid: false, reason: `Route must start at ${startName}.` };
  }
  if (route[route.length - 1] !== destName) {
    return { valid: false, reason: `Route must end at ${destName}.` };
  }

  const segLookup = new Map();
  for (const s of selectSegmentsWithNames.all()) {
    segLookup.set(keyPair(s.a, s.b), s);
  }
  const stationByName = new Map(
    selectStations.all().map((s) => [s.name, { interchange: !!s.interchange }])
  );

  const usedKeys = new Set();
  const steps = [];
  let prevLineId = null;

  for (let i = 0; i < route.length - 1; i++) {
    const from = route[i];
    const to = route[i + 1];

    if (!stationByName.has(from) || !stationByName.has(to)) {
      return { valid: false, reason: `Unknown station: ${from} → ${to}.` };
    }

    const k = keyPair(from, to);
    const seg = segLookup.get(k);
    if (!seg) {
      return { valid: false, reason: `Non-existent segment: ${from} → ${to}.` };
    }

    if (usedKeys.has(k)) {
      return { valid: false, reason: `Segment reused: ${from} → ${to}.` };
    }
    usedKeys.add(k);

    if (prevLineId !== null && seg.lineId !== prevLineId) {
      if (!stationByName.get(from)?.interchange) {
        return { valid: false, reason: `Line change outside interchange at ${from}.` };
      }
    }
    prevLineId = seg.lineId;
    steps.push({ from, to, segmentId: seg.segmentId, lineId: seg.lineId });
  }

  return { valid: true, steps, reason: null };
}
