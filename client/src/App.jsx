import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';

function ChromeShell({ children }) {
  const { pathname } = useLocation();
  if (pathname === '/login') return children;
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ChromeShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </ChromeShell>
      </BrowserRouter>
    </AuthProvider>
  );
}
