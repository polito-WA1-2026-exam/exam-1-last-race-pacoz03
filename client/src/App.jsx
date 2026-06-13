import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';

function HomePage() {
  return (
    <main>
      <h1>Last Race</h1>
      <p>Benvenuto. Accedi per iniziare a giocare.</p>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
