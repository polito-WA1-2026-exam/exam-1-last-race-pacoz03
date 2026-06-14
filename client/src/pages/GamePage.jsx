import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/API.js';
import NetworkMap from '../components/NetworkMap.jsx';
import NetworkLegend from '../components/NetworkLegend.jsx';
import PlanningView from './PlanningView.jsx';
import ExecutionView from './ExecutionView.jsx';

export default function GamePage() {
  const [phase, setPhase] = useState('setup');
  const [network, setNetwork] = useState(null);
  const [networkErr, setNetworkErr] = useState('');
  const [game, setGame] = useState(null);
  const [startErr, setStartErr] = useState('');
  const [starting, setStarting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [previousBest, setPreviousBest] = useState(null);

  async function handlePlanningSubmitted(payload) {
    try {
      const ranking = await API.getRanking();
      const me = ranking.find((r) => r.isMe);
      setPreviousBest(me?.best ?? 0);
    } catch {
      setPreviousBest(0);
    }
    setSubmitted(payload);
    setPhase('execution');
  }

  function handleExecutionFinished(summary) {
    setSubmitted((prev) => ({ ...prev, summary }));
    setPhase('result');
  }

  function resetGame() {
    setGame(null);
    setSubmitted(null);
    setPreviousBest(null);
    setPhase('setup');
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const n = await API.getNetwork();
        if (!cancelled) setNetwork(n);
      } catch (err) {
        if (!cancelled) setNetworkErr(err.message || 'Impossibile caricare la mappa.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleStart() {
    setStarting(true);
    setStartErr('');
    try {
      const g = await API.startGame();
      setGame(g);
      setPhase('planning');
    } catch (err) {
      setStartErr(err.message || 'Avvio partita fallito.');
    } finally {
      setStarting(false);
    }
  }

  if (phase === 'setup') {
    return (
      <main className="flex-grow w-full max-w-[1080px] mx-auto px-6 py-10 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-neutral-200 pb-4">
          <div className="flex flex-col gap-1 max-w-2xl">
            <span className="text-xs uppercase text-neutral-500">Fase 1 di 4</span>
            <h1 className="text-4xl font-bold uppercase tracking-tight">Setup</h1>
            <p className="text-neutral-600">
              Studia la rete: 4 linee, 14 stazioni, 4 interscambi. Quando avvii la
              partita riceverai partenza e destinazione e inizierà la pianificazione.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStart}
            disabled={!network || starting}
            className="bg-black text-white px-8 py-4 uppercase hover:bg-neutral-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {starting ? 'Avvio in corso…' : 'Inizia partita'}
          </button>
        </header>

        {networkErr && (
          <div role="alert" className="border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-xs uppercase">
            {networkErr}
          </div>
        )}
        {startErr && (
          <div role="alert" className="border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-xs uppercase">
            {startErr}
          </div>
        )}

        {network ? (
          <section className="bg-white border border-neutral-200 p-4">
            <NetworkMap network={network} variant="full" />
            <NetworkLegend lines={network.lines} />
          </section>
        ) : (
          <p className="text-neutral-600">Caricamento mappa…</p>
        )}
      </main>
    );
  }

  if (phase === 'planning' && network && game) {
    return (
      <PlanningView
        network={network}
        game={game}
        onSubmitted={handlePlanningSubmitted}
      />
    );
  }

  if (phase === 'execution' && game && submitted?.result) {
    return (
      <ExecutionView
        game={game}
        result={submitted.result}
        onFinish={handleExecutionFinished}
      />
    );
  }

  const summary = submitted?.summary;
  const finalScore = summary?.finalScore ?? 0;
  const isNewRecord = summary?.valid === true && previousBest !== null && finalScore > previousBest;

  return (
    <main className="flex-grow w-full max-w-[560px] mx-auto px-6 py-10 flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-xs uppercase tracking-widest text-neutral-500">Viaggio concluso</span>
        <h1 className="text-4xl font-bold uppercase tracking-tight">Risultato</h1>
      </div>

      <section
        className={[
          'bg-white border p-8 flex flex-col items-center gap-3 relative',
          isNewRecord ? 'border-black' : 'border-neutral-300',
        ].join(' ')}
      >
        {isNewRecord && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 text-xs uppercase tracking-widest">
            Nuovo record
          </span>
        )}
        <span className="text-xs uppercase text-neutral-500">Punteggio finale</span>
        <div className="text-7xl font-bold tabular-nums leading-none">{finalScore}</div>
        <span className="text-xs uppercase text-neutral-500">Monete</span>
        {previousBest !== null && previousBest > 0 && (
          <div className="text-xs uppercase text-neutral-500 mt-2 border-t border-neutral-200 pt-2 w-full text-center">
            Miglior precedente: <span className="tabular-nums">{previousBest}</span>
          </div>
        )}
      </section>

      {summary?.valid === false && (
        <div role="alert" className="border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
          Percorso non valido: {summary.reason || 'regole non rispettate'}.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={resetGame}
          className="flex-1 bg-black text-white px-6 py-3 uppercase hover:bg-neutral-800 transition-colors"
        >
          Nuova partita
        </button>
        <Link
          to="/classifica"
          className="flex-1 border border-black text-center px-6 py-3 uppercase hover:bg-neutral-100 transition-colors no-underline"
        >
          Vedi classifica
        </Link>
      </div>
    </main>
  );
}
