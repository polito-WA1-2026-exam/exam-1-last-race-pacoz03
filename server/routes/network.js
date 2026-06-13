import { Router } from 'express';
import db from '../db/db.js';
import { isLoggedIn } from '../auth/middleware.js';

const router = Router();

const selectLines = db.prepare('SELECT id, name, color FROM lines ORDER BY id');
const selectStations = db.prepare(
  'SELECT id, name, is_interchange AS interchange, x, y FROM stations ORDER BY id'
);
const selectSegments = db.prepare(
  'SELECT id, line_id AS lineId, station_a AS a, station_b AS b FROM segments ORDER BY id'
);

router.get('/', isLoggedIn, (req, res) => {
  const lines = selectLines.all();
  const stations = selectStations.all().map((s) => ({ ...s, interchange: !!s.interchange }));
  const segments = selectSegments.all();
  res.json({ lines, stations, segments });
});

export default router;
