import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { clearSession, fetchCurrentUser, getStoredToken, getStoredUser, setSession } from './services/api';
import './App.css';
import AdminDashboard from './pages/Admin/Dashboard';
import AuthLogin from './pages/Public/Login';
import AuthRegister from './pages/Public/RegistroConsultores';
import DetalleEstudio from './pages/Public/DetalleEstudio';
import DetalleInvestigador from './pages/Public/DetalleInvestigador';
import DetalleNoticia from './pages/Public/DetalleNoticia';
import Estudios from './pages/Public/Estudios';
import Inicio from './pages/Public/Inicio';
import Investigadores from './pages/Public/Investigadores';
import Noticias from './pages/Public/Noticias';
import PerfilConsultor from './pages/Public/PerfilConsultor';
import MisPublicaciones from './pages/Researcher/MisPublicaciones';
import ResearcherDashboard from './pages/Researcher/Dashboard';

function RequireRole({ user, roles, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const token = getStoredToken();
  const [user, setUser] = useState(() => getStoredUser());
  const [bootstrapping, setBootstrapping] = useState(() => Boolean(token));

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchCurrentUser()
      .then((currentUser) => {
        localStorage.setItem('imta_user', JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => {
        setBootstrapping(false);
      });
  }, [token]);

  const handleAuth = (payload) => {
    setSession(payload);
    setUser(payload.user);
  };

  const handleUserUpdate = (updatedUser) => {
    setSession({ access_token: getStoredToken(), user: updatedUser });
    setUser(updatedUser);
  };

  const handleLogout = async () => {
    clearSession();
    setUser(null);
  };

  if (bootstrapping) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-card">
          <div className="app-loading-orb" />
          <p>Cargando sistema administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio user={user} onLogout={handleLogout} />} />
        <Route path="/login" element={<AuthLogin user={user} onAuth={handleAuth} />} />
        <Route path="/registro" element={<AuthRegister user={user} onAuth={handleAuth} />} />
        <Route path="/estudios" element={<Estudios user={user} onLogout={handleLogout} />} />
        <Route path="/estudios/:id" element={<DetalleEstudio user={user} onLogout={handleLogout} />} />
        <Route path="/investigadores" element={<Investigadores user={user} onLogout={handleLogout} />} />
        <Route path="/investigadores/:id" element={<DetalleInvestigador user={user} onLogout={handleLogout} />} />
        <Route path="/noticias" element={<Noticias user={user} onLogout={handleLogout} />} />
        <Route path="/noticias/:id" element={<DetalleNoticia user={user} onLogout={handleLogout} />} />
        <Route
          path="/perfil"
          element={(
            <RequireRole user={user} roles={['consultor']}>
              <PerfilConsultor user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
            </RequireRole>
          )}
        />
        <Route
          path="/admin"
          element={(
            <RequireRole user={user} roles={['administrador']}>
              <AdminDashboard user={user} onLogout={handleLogout} />
            </RequireRole>
          )}
        />
        <Route
          path="/investigador"
          element={(
            <RequireRole user={user} roles={['investigador', 'administrador']}>
              <ResearcherDashboard user={user} onLogout={handleLogout} />
            </RequireRole>
          )}
        />
        <Route
          path="/mis-publicaciones"
          element={(
            <RequireRole user={user} roles={['investigador']}>
              <MisPublicaciones user={user} onLogout={handleLogout} />
            </RequireRole>
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}