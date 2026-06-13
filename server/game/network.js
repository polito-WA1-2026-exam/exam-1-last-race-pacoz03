import db from '../db/db.js';

const selectStations = db.prepare('SELECT id, name FROM stations');
const selectSegments = db.prepare('SELECT station_a AS a, station_b AS b FROM segments');

export function loadGraph() {
  const stations = selectStations.all();
  const segments = selectSegments.all();
  const adj = new Map(stations.map((s) => [s.id, new Set()]));
  for (const seg of segments) {
    adj.get(seg.a).add(seg.b);
    adj.get(seg.b).add(seg.a);
  }
  return { stations, segments, adj };
}

export function bfsDistances(adj, fromId) {
  const dist = new Map([[fromId, 0]]);
  let frontier = [fromId];
  while (frontier.length) {
    const next = [];
    for (const node of frontier) {
      const d = dist.get(node);
      for (const nb of adj.get(node)) {
        if (!dist.has(nb)) {
          dist.set(nb, d + 1);
          next.push(nb);
        }
      }
    }
    frontier = next;
  }
  return dist;
}

export function pickStartDest(minDist = 3) {
  const { stations, adj } = loadGraph();
  const ids = stations.map((s) => s.id);
  const shuffled = [...ids].sort(() => Math.random() - 0.5);
  for (const start of shuffled) {
    const dist = bfsDistances(adj, start);
    const candidates = [];
    for (const [id, d] of dist) if (d >= minDist) candidates.push(id);
    if (candidates.length) {
      const dest = candidates[Math.floor(Math.random() * candidates.length)];
      return { startId: start, destId: dest };
    }
  }
  throw new Error('Nessuna coppia partenza/destinazione con distanza minima trovata.');
}
