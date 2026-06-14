import { Router } from 'express';
import db from '../db/db.js';
import { isLoggedIn } from '../auth/middleware.js';

const router = Router();

const selectRanking = db.prepare(`
  SELECT u.id, u.username, u.display_name AS displayName,
         COALESCE(MAX(g.final_score), 0) AS best,
         COUNT(g.id) AS gamesPlayed
  FROM users u
  LEFT JOIN games g ON g.user_id = u.id AND g.valid = 1
  GROUP BY u.id
  ORDER BY best DESC, u.username ASC
`);

router.get('/', isLoggedIn, (req, res) => {
  const rows = selectRanking.all().map((r, i) => ({
    rank: i + 1,
    userId: r.id,
    username: r.username,
    displayName: r.displayName,
    best: r.best,
    gamesPlayed: r.gamesPlayed,
    isMe: r.id === req.user.id,
  }));
  res.json(rows);
});

export default router;
