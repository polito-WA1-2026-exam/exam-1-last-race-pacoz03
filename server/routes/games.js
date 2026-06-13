import { Router } from 'express';
import db from '../db/db.js';
import { isLoggedIn } from '../auth/middleware.js';
import { pickStartDest } from '../game/network.js';

const router = Router();

const insertGame = db.prepare(
  'INSERT INTO games (user_id, start_id, dest_id) VALUES (?, ?, ?)'
);
const selectStations = db.prepare('SELECT id, name FROM stations');
const selectSegmentPairs = db.prepare(
  'SELECT station_a AS a, station_b AS b FROM segments ORDER BY id'
);

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

export default router;
