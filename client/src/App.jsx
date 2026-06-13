import { BrowserRouter, Routes, Route } from 'react-router-dom';

function HomePage() {
  return (
    <main>
      <h1>Last Race</h1>
      <p>Benvenuto. Accedi per iniziare a giocare.</p>
    </main>
  );
}

function LoginPage() {
  return (
    <main>
      <h1>Accedi</h1>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
