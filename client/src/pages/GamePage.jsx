import { useEffect, useState } from 'react';
import API from '../api/API.js';
import NetworkMap from '../components/NetworkMap.jsx';
import NetworkLegend from '../components/NetworkLegend.jsx';

export default function GamePage() {
  const [phase, setPhase] = useState('setup');
  const [network, setNetwork] = useState(null);
  const [networkErr, setNetworkErr] = useState('');
  const [game, setGame] = useState(null);
  const [startErr, setStartErr] = useState('');
  const [starting, setStarting] = useState(false);

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

  return (
    <main className="flex-grow w-full max-w-[720px] mx-auto px-6 py-10 flex flex-col gap-4">
      <span className="text-xs uppercase text-neutral-500">Fase 2 di 4</span>
      <h1 className="text-4xl font-bold uppercase tracking-tight">Pianificazione</h1>
      <p className="text-neutral-600">
        Partenza: <strong>{game?.start?.name}</strong> · Arrivo: <strong>{game?.destination?.name}</strong>
      </p>
      <p className="text-neutral-500 text-sm">In costruzione.</p>
    </main>
  );
}
