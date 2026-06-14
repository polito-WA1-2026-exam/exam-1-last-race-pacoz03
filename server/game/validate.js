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

// Chiave non orientata per identificare un segmento indipendentemente
// dall'ordine in cui le due stazioni vengono inviate dal client.
function keyPair(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

// Verifica che la sequenza di stazioni inviata dal client sia un percorso
// legale: parte da start, arriva a dest, usa solo segmenti esistenti senza
// riusarli e cambia linea soltanto nelle stazioni di interscambio.
// Ritorna { valid: true, steps, reason: null } o { valid: false, reason }.
export function validateRoute(route, game) {
  // Servono almeno 2 stazioni per fare 1 tratta.
  if (!Array.isArray(route) || route.length < 2) {
    return { valid: false, reason: 'Percorso vuoto o troppo corto.' };
  }

  // Risolvo i nomi di partenza/arrivo a partire dagli id memorizzati in games.
  const startName = selectStationById.get(game.start_id)?.name;
  const destName = selectStationById.get(game.dest_id)?.name;
  if (!startName || !destName) {
    return { valid: false, reason: 'Partita mal formata.' };
  }
  if (route[0] !== startName) {
    return { valid: false, reason: `Il percorso deve partire da ${startName}.` };
  }
  if (route[route.length - 1] !== destName) {
    return { valid: false, reason: `Il percorso deve arrivare a ${destName}.` };
  }

  // Indice dei segmenti per lookup O(1) sulla coppia non orientata.
  const segLookup = new Map();
  for (const s of selectSegmentsWithNames.all()) {
    segLookup.set(keyPair(s.a, s.b), s);
  }
  // Mappa nome → flag interscambio per il check sui cambi linea.
  const stationByName = new Map(
    selectStations.all().map((s) => [s.name, { interchange: !!s.interchange }])
  );

  const usedKeys = new Set(); // tratte già percorse (non riutilizzabili)
  const steps = [];
  let prevLineId = null; // linea della tratta precedente, per il cambio linea

  for (let i = 0; i < route.length - 1; i++) {
    const from = route[i];
    const to = route[i + 1];

    // 1) Entrambe le stazioni devono esistere nella rete.
    if (!stationByName.has(from) || !stationByName.has(to)) {
      return { valid: false, reason: `Stazione sconosciuta: ${from} → ${to}.` };
    }

    // 2) La coppia consecutiva deve corrispondere a un segmento reale.
    const k = keyPair(from, to);
    const seg = segLookup.get(k);
    if (!seg) {
      return { valid: false, reason: `Tratta inesistente: ${from} → ${to}.` };
    }

    // 3) Stesso segmento non può essere riusato nella stessa partita.
    if (usedKeys.has(k)) {
      return { valid: false, reason: `Segmento riusato: ${from} → ${to}.` };
    }
    usedKeys.add(k);

    // 4) Se cambia la linea rispetto alla tratta precedente, la stazione
    //    di transito (`from`) deve essere un interscambio.
    if (prevLineId !== null && seg.lineId !== prevLineId) {
      if (!stationByName.get(from)?.interchange) {
        return { valid: false, reason: `Cambio linea fuori interscambio a ${from}.` };
      }
    }
    prevLineId = seg.lineId;
    steps.push({ from, to, segmentId: seg.segmentId, lineId: seg.lineId });
  }

  return { valid: true, steps, reason: null };
}
