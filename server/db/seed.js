import db from './db.js';
import { hashPassword } from '../auth/passport.js';

const LINES = [
  { name: 'Rossa',   color: '#E2231A' },
  { name: 'Blu',     color: '#0057B8' },
  { name: 'Verde',   color: '#00843D' },
  { name: 'Gialla',  color: '#FFC20E' },
];

const STATIONS = [
  { name: 'Aurora',     x: 100, y: 100, interchange: false },
  { name: 'Belvedere',  x: 200, y: 100, interchange: false },
  { name: 'Fontego',    x: 400, y: 100, interchange: false },
  { name: 'Cardo',      x: 300, y: 250, interchange: false },
  { name: 'Gineceo',    x: 450, y: 350, interchange: false },
  { name: 'Mercato',    x: 600, y: 350, interchange: false },
  { name: 'Decumano',   x: 300, y: 450, interchange: false },
  { name: 'Lanterna',   x: 550, y: 450, interchange: false },
  { name: 'Navile',     x: 600, y: 550, interchange: false },
  { name: 'Rivellino',  x: 750, y: 550, interchange: false },
  { name: 'Eridano',    x: 200, y: 600, interchange: false },
  { name: 'Ostiense',   x: 500, y: 650, interchange: false },
  { name: 'Quadrivio',  x: 600, y: 650, interchange: false },
  { name: 'Palatino',   x: 750, y: 650, interchange: false },
];

const LINE_PATHS = {
  Rossa:  ['Aurora', 'Belvedere', 'Cardo', 'Decumano', 'Eridano'],
  Blu:    ['Cardo', 'Fontego', 'Gineceo', 'Lanterna'],
  Verde:  ['Decumano', 'Gineceo', 'Mercato', 'Navile', 'Ostiense'],
  Gialla: ['Palatino', 'Quadrivio', 'Navile', 'Rivellino'],
};

const USERS = [
  { username: 'mario',  displayName: 'Mario Rossi',     password: 'mario123'  },
  { username: 'lucia',  displayName: 'Lucia Bianchi',   password: 'lucia123'  },
  { username: 'enzo',   displayName: 'Enzo Verdi',      password: 'enzo123'   },
];

const insertLine = db.prepare(
  'INSERT OR IGNORE INTO lines (name, color) VALUES (?, ?)'
);
const insertStation = db.prepare(
  'INSERT OR IGNORE INTO stations (name, is_interchange, x, y) VALUES (?, ?, ?, ?)'
);
const insertSegment = db.prepare(
  'INSERT OR IGNORE INTO segments (line_id, station_a, station_b) VALUES (?, ?, ?)'
);
const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (username, display_name, salt, password_hash) VALUES (?, ?, ?, ?)'
);
const getLineId    = db.prepare('SELECT id FROM lines WHERE name = ?');
const getStationId = db.prepare('SELECT id FROM stations WHERE name = ?');
const getUserId    = db.prepare('SELECT id FROM users WHERE username = ?');

function seedNetwork() {
  const tx = db.transaction(() => {
    for (const l of LINES) insertLine.run(l.name, l.color);
    for (const s of STATIONS) insertStation.run(s.name, s.interchange ? 1 : 0, s.x, s.y);
    for (const [lineName, path] of Object.entries(LINE_PATHS)) {
      const lineId = getLineId.get(lineName).id;
      for (let i = 0; i < path.length - 1; i++) {
        const a = getStationId.get(path[i]).id;
        const b = getStationId.get(path[i + 1]).id;
        insertSegment.run(lineId, a, b);
      }
    }
  });
  tx();
}

async function seedUsers() {
  for (const u of USERS) {
    const existing = getUserId.get(u.username);
    if (existing) continue;
    const { salt, hash } = await hashPassword(u.password);
    insertUser.run(u.username, u.displayName, salt, hash);
  }
}

async function main() {
  seedNetwork();
  await seedUsers();
  console.log('[seed] OK');
}

main().catch((err) => {
  console.error('[seed] ERROR', err);
  process.exit(1);
});
