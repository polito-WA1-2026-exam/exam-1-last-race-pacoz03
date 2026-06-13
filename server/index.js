import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import passport from './auth/passport.js';
import sessionsRouter from './routes/sessions.js';
import networkRouter from './routes/network.js';
import gamesRouter from './routes/games.js';
import './db/db.js';

const app = express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, origin);
    return cb(new Error(`Origin non consentita: ${origin}`));
  },
  credentials: true,
}));

app.use(session({
  name: 'lastrace.sid',
  secret: process.env.SESSION_SECRET || 'last-race-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 8,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', authenticated: req.isAuthenticated() });
});

app.use('/api/sessions', sessionsRouter);
app.use('/api/network', networkRouter);
app.use('/api/games', gamesRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Errore interno.' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
