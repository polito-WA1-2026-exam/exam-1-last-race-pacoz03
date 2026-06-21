import { Router } from 'express';
import passport from '../auth/passport.js';

const router = Router();

function validateCredentialsBody(req, res, next) {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username is required.' });
  }
  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: 'Password is required.' });
  }
  next();
}

router.post('/', validateCredentialsBody, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid credentials.' });
    }
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.json(user);
    });
  })(req, res, next);
});

router.get('/current', (req, res) => {
  if (req.isAuthenticated()) return res.json(req.user);
  return res.status(401).json({ error: 'Not authenticated.' });
});

router.delete('/current', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);
      res.clearCookie('lastrace.sid');
      res.status(204).end();
    });
  });
});

export default router;
