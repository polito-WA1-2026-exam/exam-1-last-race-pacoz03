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

// Unordered key to identify a segment regardless of the order in which
// the two stations are sent by the client.
function keyPair(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

// Checks that the station sequence sent by the client is a legal route:
// starts from start, reaches dest, uses only existing segments without
// reusing them, and changes line only at interchange stations.
// Returns { valid: true, steps, reason: null } or { valid: false, reason }.
export function validateRoute(route, game) {
  // At least 2 stations are needed to form 1 segment.
  if (!Array.isArray(route) || route.length < 2) {
    return { valid: false, reason: 'Route is empty or too short.' };
  }

  // Resolve start/destination names from the IDs stored in games.
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

  // Segment index for O(1) lookup on the unordered pair.
  const segLookup = new Map();
  for (const s of selectSegmentsWithNames.all()) {
    segLookup.set(keyPair(s.a, s.b), s);
  }
  // Map name → interchange flag for the line-change check.
  const stationByName = new Map(
    selectStations.all().map((s) => [s.name, { interchange: !!s.interchange }])
  );

  const usedKeys = new Set(); // already-used segments (non-reusable)
  const steps = [];
  let prevLineId = null; // line of the previous segment, for line-change detection

  for (let i = 0; i < route.length - 1; i++) {
    const from = route[i];
    const to = route[i + 1];

    // 1) Both stations must exist in the network.
    if (!stationByName.has(from) || !stationByName.has(to)) {
      return { valid: false, reason: `Unknown station: ${from} → ${to}.` };
    }

    // 2) The consecutive pair must correspond to a real segment.
    const k = keyPair(from, to);
    const seg = segLookup.get(k);
    if (!seg) {
      return { valid: false, reason: `Non-existent segment: ${from} → ${to}.` };
    }

    // 3) The same segment cannot be reused in the same game.
    if (usedKeys.has(k)) {
      return { valid: false, reason: `Segment reused: ${from} → ${to}.` };
    }
    usedKeys.add(k);

    // 4) If the line changes from the previous segment, the transit station
    //    (`from`) must be an interchange.
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
