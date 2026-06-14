import db from './db.js';
import { hashPassword } from '../auth/passport.js';

const LINES = [
  { name: 'Rossa',   color: '#E2231A' },
  { name: 'Blu',     color: '#0057B8' },
  { name: 'Verde',   color: '#00843D' },
  { name: 'Gialla',  color: '#FFC20E' },
];

const STATIONS = [
  { name: 'Aurora',     x:  70, y: 138, interchange: false },
  { name: 'Belvedere',  x: 206, y: 138, interchange: false },
  { name: 'Fontego',    x: 478, y: 138, interchange: false },
  { name: 'Cardo',      x: 342, y: 274, interchange: true  },
  { name: 'Gineceo',    x: 478, y: 342, interchange: true  },
  { name: 'Mercato',    x: 682, y: 342, interchange: false },
  { name: 'Decumano',   x: 342, y: 478, interchange: true  },
  { name: 'Lanterna',   x: 614, y: 478, interchange: false },
  { name: 'Navile',     x: 682, y: 546, interchange: true  },
  { name: 'Rivellino',  x: 818, y: 546, interchange: false },
  { name: 'Eridano',    x: 206, y: 614, interchange: false },
  { name: 'Ostiense',   x: 546, y: 682, interchange: false },
  { name: 'Quadrivio',  x: 682, y: 682, interchange: false },
  { name: 'Palatino',   x: 818, y: 682, interchange: false },
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

const countUserGames = db.prepare('SELECT COUNT(*) AS n FROM games WHERE user_id = ?');
const insertGame = db.prepare(`
  INSERT INTO games (user_id, start_id, dest_id, final_score, valid, created_at)
  VALUES (?, ?, ?, ?, 1, datetime('now'))
`);

const SAMPLE_GAMES = [
  { username: 'mario', start: 'Aurora',   dest: 'Mercato',  score: 27 },
  { username: 'lucia', start: 'Eridano',  dest: 'Lanterna', score: 20 },
];

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

function seedSampleGames() {
  for (const g of SAMPLE_GAMES) {
    const userRow = getUserId.get(g.username);
    if (!userRow) continue;
    if (countUserGames.get(userRow.id).n > 0) continue;
    const startId = getStationId.get(g.start).id;
    const destId  = getStationId.get(g.dest).id;
    insertGame.run(userRow.id, startId, destId, g.score);
  }
}

async function main() {
  seedNetwork();
  await seedUsers();
  seedSampleGames();
  console.log('[seed] OK');
}

main().catch((err) => {
  console.error('[seed] ERROR', err);
  process.exit(1);
});
