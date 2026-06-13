import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth.js';
import NetworkLegend from '../components/NetworkLegend.jsx';

const LINES = [
  { id: 1, name: 'Rossa',  color: '#E2231A' },
  { id: 2, name: 'Blu',    color: '#0057B8' },
  { id: 3, name: 'Verde',  color: '#00843D' },
  { id: 4, name: 'Gialla', color: '#FFC20E' },
];

const PHASES = [
  {
    n: 1,
    title: 'Setup',
    text: 'Esamini la mappa completa della rete: 4 linee, 14 stazioni, 4 interscambi. Quando avvii la partita ricevi una coppia partenza/destinazione casuale, distante almeno 3 segmenti.',
  },
  {
    n: 2,
    title: 'Pianificazione',
    text: 'Hai 90 secondi per costruire un percorso valido: sequenza contigua di tratte dalla partenza all\'arrivo, senza riusare lo stesso segmento e cambiando linea solo nelle stazioni di interscambio.',
  },
  {
    n: 3,
    title: 'Esecuzione',
    text: 'Parti con 20 monete. Per ogni tratta del percorso il server estrae un evento casuale con effetto da −4 a +4 e aggiorna il saldo. Questa fase non ha timer.',
  },
  {
    n: 4,
    title: 'Risultato',
    text: 'Il punteggio è il saldo finale in monete. Se il percorso è invalido o incompleto perdi tutto e il punteggio è 0; i saldi negativi sono memorizzati come 0. La classifica conserva il tuo miglior punteggio.',
  },
];

const RULES = [
  { label: 'Inizi con', value: '20 monete' },
  { label: 'Timer di pianificazione', value: '90 secondi' },
  { label: 'Eventi per tratta', value: 'da −4 a +4' },
  { label: 'Distanza minima', value: '3 segmenti' },
];

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <main className="flex-grow w-full max-w-[720px] mx-auto px-6 py-10 flex flex-col gap-10">
      <section className="flex flex-col gap-4 text-center py-10 border-b border-neutral-200">
        <h1 className="text-4xl font-bold uppercase tracking-tight">
          Last Race
        </h1>
        <p className="text-lg text-neutral-600 max-w-prose mx-auto">
          Pianifica la rotta. Pesa gli eventi. Arriva a destinazione col punteggio più alto.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold uppercase tracking-tight border-b border-neutral-200 pb-2">
          Le fasi del gioco
        </h2>
        <div className="flex flex-col gap-4">
          {PHASES.map((p) => (
            <article
              key={p.n}
              className="bg-white border border-neutral-200 p-4 flex gap-4 items-start"
            >
              <div
                className="w-12 h-12 bg-black text-white flex items-center justify-center text-xl font-bold flex-shrink-0"
                aria-hidden="true"
              >
                {p.n}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold uppercase">{p.title}</h3>
                <p className="text-neutral-600">{p.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold uppercase border-b border-neutral-200 pb-2">La rete</h2>
        <NetworkLegend lines={LINES} />
      </section>

      <section className="bg-neutral-50 border-l-4 border-black p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold uppercase">Regole chiave</h2>
        <ul className="flex flex-col gap-2 text-xs">
          {RULES.map((r) => (
            <li key={r.label} className="flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 bg-black rounded-full" aria-hidden="true" />
              <span className="uppercase">{r.label}</span>
              <span className="bg-white px-2 py-1 border border-neutral-200 uppercase">
                {r.value}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 mb-10">
        <div className="bg-white border border-neutral-200 flex flex-col sm:flex-row">
          <div className="p-6 flex-grow flex flex-col justify-center gap-2">
            {loading ? (
              <h2 className="text-2xl font-semibold uppercase tracking-tight">
                Caricamento sessione…
              </h2>
            ) : user ? (
              <>
                <h2 className="text-2xl font-semibold uppercase tracking-tight">
                  Bentornato, {user.displayName}
                </h2>
                <p className="text-neutral-600">
                  La rete è pronta: scegli se partire ora o controllare la classifica.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold uppercase tracking-tight">
                  Accedi per giocare
                </h2>
                <p className="text-neutral-600">
                  La vista anonima mostra solo le istruzioni. Per ricevere partenza e destinazione devi prima accedere.
                </p>
              </>
            )}
          </div>
          <div className="p-6 sm:w-72 flex flex-col items-stretch justify-center gap-2 bg-neutral-50 border-t sm:border-t-0 sm:border-l border-neutral-200">
            {user ? (
              <>
                <Link
                  to="/gioca"
                  className="bg-black text-white px-6 py-3 text-center uppercase no-underline hover:bg-neutral-800 transition-colors"
                >
                  Avvia partita
                </Link>
                <Link
                  to="/classifica"
                  className="border border-black px-6 py-3 text-center uppercase no-underline hover:bg-neutral-100 transition-colors"
                >
                  Classifica
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-black text-white px-6 py-3 text-center uppercase no-underline hover:bg-neutral-800 transition-colors"
              >
                Accedi
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
