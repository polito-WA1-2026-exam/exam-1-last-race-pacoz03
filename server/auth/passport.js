import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import db from '../db/db.js';

const scryptAsync = promisify(scrypt);
const KEY_LEN = 32;

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scryptAsync(password, salt, KEY_LEN);
  return { salt, hash: derived.toString('hex') };
}

async function verifyPassword(password, salt, expectedHashHex) {
  const derived = await scryptAsync(password, salt, KEY_LEN);
  const expected = Buffer.from(expectedHashHex, 'hex');
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

const getUserByUsername = db.prepare('SELECT * FROM users WHERE username = ?');
const getUserById = db.prepare('SELECT id, username, display_name FROM users WHERE id = ?');

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const row = getUserByUsername.get(username.trim());
    if (!row) return done(null, false, { message: 'Credenziali non valide.' });
    const ok = await verifyPassword(password, row.salt, row.password_hash);
    if (!ok) return done(null, false, { message: 'Credenziali non valide.' });
    return done(null, { id: row.id, username: row.username, displayName: row.display_name });
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  try {
    const row = getUserById.get(id);
    if (!row) return done(null, false);
    return done(null, { id: row.id, username: row.username, displayName: row.display_name });
  } catch (err) {
    return done(err);
  }
});

export default passport;
