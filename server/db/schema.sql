CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  salt          TEXT NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lines (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stations (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL UNIQUE,
  is_interchange  INTEGER NOT NULL DEFAULT 0,
  x               INTEGER NOT NULL,
  y               INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS segments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  line_id     INTEGER NOT NULL REFERENCES lines(id),
  station_a   INTEGER NOT NULL REFERENCES stations(id),
  station_b   INTEGER NOT NULL REFERENCES stations(id),
  UNIQUE(line_id, station_a, station_b)
);

CREATE TABLE IF NOT EXISTS events (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  name   TEXT NOT NULL UNIQUE,
  effect INTEGER NOT NULL CHECK (effect BETWEEN -4 AND 4)
);

CREATE TABLE IF NOT EXISTS games (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id),
  start_id     INTEGER NOT NULL REFERENCES stations(id),
  dest_id      INTEGER NOT NULL REFERENCES stations(id),
  final_score  INTEGER,
  valid        INTEGER,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS game_steps (
  game_id   INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  idx       INTEGER NOT NULL,
  from_id   INTEGER NOT NULL REFERENCES stations(id),
  to_id     INTEGER NOT NULL REFERENCES stations(id),
  event_id  INTEGER NOT NULL REFERENCES events(id),
  effect    INTEGER NOT NULL,
  total     INTEGER NOT NULL,
  PRIMARY KEY (game_id, idx)
);
