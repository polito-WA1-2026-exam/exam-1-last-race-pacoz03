import { Router } from 'express';
import db from '../db/db.js';
import { isLoggedIn } from '../auth/middleware.js';
import { pickStartDest } from '../game/network.js';
import { validateRoute } from '../game/validate.js';
import { loadEvents, pickRandomEvent } from '../game/events.js';

const router = Router();

const insertGame = db.prepare(
  'INSERT INTO games (user_id, start_id, dest_id) VALUES (?, ?, ?)'
);
const selectStations = db.prepare('SELECT id, name FROM stations');
const selectSegmentPairs = db.prepare(
  'SELECT station_a AS a, station_b AS b FROM segments ORDER BY id'
);
const selectGame = db.prepare('SELECT * FROM games WHERE id = ?');
const selectStationIdByName = db.prepare('SELECT id FROM stations WHERE name = ?');
const updateGameResult = db.prepare(
  'UPDATE games SET final_score = ?, valid = ? WHERE id = ?'
);
const insertGameStep = db.prepare(`
  INSERT INTO game_steps (game_id, idx, from_id, to_id, event_id, effect, total)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const INITIAL_COINS = 20;

router.post('/', isLoggedIn, (req, res, next) => {
  try {
    const { startId, destId } = pickStartDest(3);
    const info = insertGame.run(req.user.id, startId, destId);

    const stationsById = new Map(selectStations.all().map((s) => [s.id, s.name]));
    const segments = selectSegmentPairs.all().map((s) => ({
      a: stationsById.get(s.a),
      b: stationsById.get(s.b),
    }));

    res.json({
      gameId: Number(info.lastInsertRowid),
      start: { id: startId, name: stationsById.get(startId) },
      destination: { id: destId, name: stationsById.get(destId) },
      segments,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/games/:id/route — submit the route built during planning.
// Validates server-side, applies events segment by segment, always persists
// the result (even if invalid = score 0) and rejects resubmissions.
router.post('/:id/route', isLoggedIn, (req, res, next) => {
  try {
    const gameId = Number(req.params.id);
    if (!Number.isInteger(gameId) || gameId <= 0) {
      return res.status(400).json({ error: 'Invalid game ID.' });
    }
    const game = selectGame.get(gameId);
    if (!game) return res.status(404).json({ error: 'Game not found.' });
    if (game.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Game does not belong to this user.' });
    }
    if (game.valid !== null) {
      return res.status(409).json({ error: 'Game already completed.' });
    }
    const { route } = req.body || {};
    if (!Array.isArray(route) || route.some((s) => typeof s !== 'string')) {
      return res.status(400).json({ error: 'Invalid route payload.' });
    }

    const v = validateRoute(route, game);

    // Invalid route: record the game as lost (score 0, valid 0).
    if (!v.valid) {
      updateGameResult.run(0, 0, gameId);
      return res.json({
        gameId,
        valid: false,
        reason: v.reason,
        steps: [],
        finalScore: 0,
      });
    }

    // Valid route: draw a random event for each segment and accumulate the
    // coin balance starting from the initial allowance.
    const events = loadEvents();
    let running = INITIAL_COINS;
    const persistedSteps = [];
    const responseSteps = [];

    for (let i = 0; i < v.steps.length; i++) {
      const step = v.steps[i];
      const ev = pickRandomEvent(events);
      running += ev.effect;
      const fromId = selectStationIdByName.get(step.from).id;
      const toId = selectStationIdByName.get(step.to).id;
      persistedSteps.push({
        idx: i, fromId, toId,
        eventId: ev.id, effect: ev.effect, total: running,
      });
      responseSteps.push({
        from: step.from,
        to: step.to,
        event: ev.name,
        effect: ev.effect,
        total: running,
      });
    }

    // Score cannot be negative: balances below zero are stored as 0.
    const finalScore = Math.max(0, running);

    const tx = db.transaction(() => {
      updateGameResult.run(finalScore, 1, gameId);
      for (const s of persistedSteps) {
        insertGameStep.run(gameId, s.idx, s.fromId, s.toId, s.eventId, s.effect, s.total);
      }
    });
    tx();

    return res.json({
      gameId,
      valid: true,
      reason: null,
      steps: responseSteps,
      finalScore,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
