import { useEffect, useState } from 'react';
import API from '../api/API.js';
import NetworkMap from '../components/NetworkMap.jsx';

export default function GamePage() {
  const [network, setNetwork] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.getNetwork()
      .then(setNetwork)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main className="flex-grow w-full max-w-[900px] mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold uppercase tracking-tight mb-6">Mappa rete</h1>
      {error && <p className="text-red-600">{error}</p>}
      {!network && !error && <p className="text-neutral-600">Caricamento…</p>}
      {network && <NetworkMap network={network} />}
    </main>
  );
}
