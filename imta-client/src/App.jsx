import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Importamos los componentes modulares de las páginas
import Inicio from './pages/Public/Inicio';
import Login from './pages/Public/Login';
import RegistroConsultores from './pages/Public/RegistroConsultores';
import DetalleEstudio from './pages/Public/DetalleEstudio';

export default function App() {
  const [user, setUser] = useState(null);
  const handleLogout = () => setUser(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
        {/* NAVBAR INSTITUCIONAL FIJO (Sale en todas las páginas) */}
        <header className="bg-cereza text-white p-4 shadow-md flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-wide">IMTA</h1>
            <span className="text-xs text-ramei hidden sm:inline">| Lab. Enzo Levi</span>
          </div>
          <nav className="flex space-x-4 items-center">
            <Link to="/" className="hover:text-ramei text-sm transition-colors">Inicio</Link>
            
            {!user ? (
              <>
                <Link to="/login" className="bg-boio px-3 py-1.5 rounded text-sm">Iniciar Sesión</Link>
                <Link to="/registro" className="border border-white px-3 py-1.5 rounded text-sm hover:bg-white hover:text-cereza">Registrarse</Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="text-xs text-ramei font-medium">Hola, {user.name}</span>
                {user.role === 'admin' && <Link to="/admin" className="text-xs bg-boio px-2 py-1 rounded">Admin</Link>}
                {user.role === 'investigador' && <Link to="/investigador" className="text-xs bg-gray-700 px-2 py-1 rounded">Investigador</Link>}
                <button onClick={handleLogout} className="bg-grisCustom text-cereza px-2 py-1 text-xs rounded font-bold">Salir</button>
              </div>
            )}
          </nav>
        </header>

        {/* CONTENEDOR DE RUTAS DINÁMICAS */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Inicio user={user} onLogout={handleLogout} />} />
            <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
            <Route path="/registro" element={<RegistroConsultores />} />
            <Route path="/estudio/:id" element={<DetalleEstudio user={user} />} />
            
            {/* Próximos entornos de los siguientes mockups */}
            <Route path="/admin" element={<div className="p-6"><h2>Panel de Administración</h2></div>} />
            <Route path="/investigador" element={<div className="p-6"><h2>Panel de Investigador</h2></div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}