import db from './db.js';
import { hashPassword } from '../auth/passport.js';

const USERS = [
  { username: 'mario',  displayName: 'Mario Rossi',     password: 'mario123'  },
  { username: 'lucia',  displayName: 'Lucia Bianchi',   password: 'lucia123'  },
  { username: 'enzo',   displayName: 'Enzo Verdi',      password: 'enzo123'   },
];

const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (username, display_name, salt, password_hash) VALUES (?, ?, ?, ?)'
);
const getUserId = db.prepare('SELECT id FROM users WHERE username = ?');

async function seedUsers() {
  for (const u of USERS) {
    const existing = getUserId.get(u.username);
    if (existing) continue;
    const { salt, hash } = await hashPassword(u.password);
    insertUser.run(u.username, u.displayName, salt, hash);
  }
}

async function main() {
  await seedUsers();
  console.log('[seed] OK');
}

main().catch((err) => {
  console.error('[seed] ERROR', err);
  process.exit(1);
});
