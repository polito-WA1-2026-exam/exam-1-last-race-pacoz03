# Exam #1: "Last Race"
## Student: s123456 LASTNAME FIRSTNAME

> SPA single-player ambientata su una rete metropolitana fittizia. Il giocatore
> riceve partenza e destinazione, pianifica un percorso valido in 90 secondi
> e lo esegue: ogni tratta percorsa innesca un evento casuale (da −4 a +4
> monete) e il punteggio finale è il saldo in monete a fine corsa.

## Avvio del progetto

Sono richiesti **Node 24 LTS** e **npm**. Pattern **"two servers"**: client su
`:5173`, server su `:3001`, sessione via cookie HTTP-only con `credentials`.

```sh
# 1) Backend
cd server
npm install
npm run seed   # solo la prima volta, popola SQLite (idempotente)
npm start      # node su http://localhost:3001

# 2) Frontend (in un'altra shell)
cd client
npm install
npm run dev    # Vite su http://localhost:5173
```

## React Client Application Routes

- Route `/` — pagina **Istruzioni**. Accessibile anche agli anonimi. Mostra
  le 4 fasi del gioco e le regole chiave; CTA verso `/login` per l'anonimo,
  "Avvia partita" + "Classifica" per l'utente loggato.
- Route `/login` — form di **accesso**. Card "biglietto" con campi
  `username`/`password`, validazione client (campi obbligatori) e server
  (Passport local + `crypto.scrypt`).
- Route `/gioca` — protetta. Macchina a stati `setup → planning`. Setup mostra
  la mappa completa con legenda e bottone "Inizia partita". Planning: timer
  90 s, mappa "Vista nodi" senza linee, lista 14 segmenti selezionabili una
  volta sola, chip "Percorso in costruzione", "Conferma percorso".
- Route `/classifica` — protetta. In sviluppo.

## API Server

Tutte le rotte sono sotto `/api` e ritornano JSON. Le rotte protette richiedono
una sessione Passport valida; in assenza rispondono `401 { error }`.

### Health
- **GET `/api/health`** — pubblico.
  - **Risposta 200**: `{ "status": "ok", "authenticated": <boolean> }`.
  - Usata anche dal client per il bootstrap della sessione (evita 401 in
    console quando l'utente è anonimo).

### Sessioni
- **POST `/api/sessions`** — login.
  - **Body**: `{ "username": <string>, "password": <string> }` (entrambi
    obbligatori e non vuoti, validati lato Express e lato React).
  - **Risposta 200**: `{ "id": <number>, "username": <string>, "displayName": <string> }`.
  - **400**: `{ "error": "Username obbligatorio." | "Password obbligatoria." }`.
  - **401**: `{ "error": "Credenziali non valide." }`.
- **GET `/api/sessions/current`** — utente loggato. *Protetta.*
  - **Risposta 200**: `{ "id", "username", "displayName" }`.
  - **401**: `{ "error": "Non autenticato." }`.
- **DELETE `/api/sessions/current`** — logout. *Protetta.*
  - **Risposta 204** (vuota) + cookie `lastrace.sid` invalidato.

### Rete (mappa)
- **GET `/api/network`** — *protetta.*
  - **Risposta 200**:
    ```json
    {
      "lines":    [ { "id", "name", "color" } ],
      "stations": [ { "id", "name", "interchange": <boolean>, "x", "y" } ],
      "segments": [ { "id", "lineId", "a": <stationId>, "b": <stationId> } ]
    }
    ```

### Partite
- **POST `/api/games`** — nuova partita. *Protetta.*
  - **Body**: nessuno.
  - **Risposta 200**:
    ```json
    {
      "gameId": <number>,
      "start":       { "id", "name" },
      "destination": { "id", "name" },
      "segments": [ { "a": <stationName>, "b": <stationName> } ]
    }
    ```
    Il server sceglie partenza/destinazione con distanza minima 3 segmenti.
    I segmenti ritornati contengono solo coppie di nomi: la linea di
    appartenenza non viene esposta in Pianificazione.

### Classifica
- **GET `/api/ranking`** — *protetta.*
  - **Risposta 200**: array di `{ rank, userId, username, displayName, best, gamesPlayed, isMe }`
    ordinato per `best DESC, username ASC`. Per ogni utente `best` =
    `MAX(final_score)` sulle sole partite con `valid=1` (0 se nessuna).

## Database Tables

File SQLite: `server/db/last_race.sqlite`. Schema in `server/db/schema.sql`.

- **`users`** — utenti registrati. Colonne: `id`, `username` (UNIQUE),
  `display_name`, `salt`, `password_hash`. Password salate e cifrate con
  `crypto.scrypt` (hash esadecimale di 32 byte).
- **`lines`** — 4 linee metro (Rossa, Blu, Verde, Gialla). Colonne: `id`,
  `name` (UNIQUE), `color` (hex).
- **`stations`** — 14 stazioni con coordinate. Colonne: `id`, `name` (UNIQUE),
  `is_interchange` (0/1), `x`, `y`.
- **`segments`** — 14 archi (adiacenze tra stazioni). Colonne: `id`, `line_id`,
  `station_a`, `station_b`, UNIQUE su `(line_id, station_a, station_b)`.
- **`games`** — partite giocate. Colonne: `id`, `user_id`, `start_id`,
  `dest_id`, `final_score` (`NULL` finché non conclusa), `valid` (0/1/NULL),
  `created_at`. Saldi negativi vengono memorizzati come 0.
- **`game_steps`** — eventi applicati tratta per tratta. Chiave composta
  `(game_id, idx)`. Colonne: `from_id`, `to_id`, `event_id`, `effect`,
  `total` (monete cumulative dopo lo step).

## Main React Components

- **`App`** (`App.jsx`) — `BrowserRouter` + `AuthProvider`. Wrapper
  `ChromeShell` che nasconde Header/Footer sulla rotta `/login`. Rotte
  protette via `ProtectedRoute`.
- **`AuthProvider`** (`contexts/AuthContext.jsx`) — context con `user`,
  `loading`, `login`, `logout`. Bootstrap della sessione tramite
  `GET /api/health` per non emettere 401 in console quando anonimo.
  Hook `useAuth` esposto da `contexts/useAuth.js` (file separato per il
  linter react-refresh).
- **`ProtectedRoute`** (`components/ProtectedRoute.jsx`) — redirect a
  `/login` mantenendo l'URL d'origine in `location.state.from`.
- **`Header` / `Footer`** (`components/`) — chrome globale. Header mostra
  "Accedi" per l'anonimo, `displayName` + "Logout" per l'utente loggato.
- **`HomePage`** (`pages/HomePage.jsx`) — Istruzioni: 4 fasi del gioco,
  regole chiave, CTA contestualizzata (anonimo vs loggato).
- **`LoginPage`** (`pages/LoginPage.jsx`) — form di accesso con validazione
  campi + gestione errore credenziali.
- **`api/API.js`** — wrapper `fetch` con `credentials: 'include'` e gestione
  errori JSON/testo.

## Users Credentials

Definiti in `server/db/seed.js` (idempotente).

| username | password  |
|----------|-----------|
| `mario`  | mario123  |
| `lucia`  | lucia123  |
| `enzo`   | enzo123   |
