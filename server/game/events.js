import db from '../db/db.js';

const selectEvents = db.prepare('SELECT id, name, effect FROM events');

export function loadEvents() {
  return selectEvents.all();
}

export function pickRandomEvent(events) {
  return events[Math.floor(Math.random() * events.length)];
}
