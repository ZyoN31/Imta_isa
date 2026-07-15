import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Importaciones temporales o placeholders de páginas públicas
const Home = () => <div className="p-6"><h2>Inicio - Laboratorio de Hidráulica IMTA</h2></div>;
const Investigadores = () => <div className="p-6"><h2>Directorio de Investigadores (Filtros de área/grado)</h2></div>;
const Estudios = () => <div className="p-6"><h2>Estudios Técnicos Publicados</h2></div>;

// Placeholders Panel Administrador
const DashboardAdmin = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Panel de Control General (Administrador)</h2>
    <div className="flex gap-4">
      <Link to="/admin/investigadores" className="p-4 bg-blue-600 text-white rounded">Gestionar Investigadores</Link>
      <Link to="/admin/comentarios" className="p-4 bg-green-600 text-white rounded">Moderar Comentarios</Link>
      <Link to="/admin/reportes" className="p-4 bg-purple-600 text-white rounded">Generar Reportes PDF</Link>
    </div>
  </div>
);
const GestionInvestigadores = () => <div className="p-6"><h2>Formulario de Alta y Tabla de Investigadores</h2></div>;
const GestionComentarios = () => <div className="p-6"><h2>Lista de Comentarios (ID, Contenido, Usuario, Acciones)</h2></div>;
const Reportes = () => <div className="p-6"><h2>Filtros para Exportación de Reportes a PDF</h2></div>;

// Placeholders Panel Investigador
const DashboardInvestigador = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Panel Académico (Investigador)</h2>
    <div className="flex gap-4">
      <Link to="/investigador/publicar-noticia" className="p-4 bg-orange-500 text-white rounded">Publicar Noticia</Link>
      <Link to="/investigador/publicar-estudio" className="p-4 bg-indigo-500 text-white rounded">Cargar Estudio Técnico</Link>
    </div>
  </div>
);
const PublicarNoticia = () => <div className="p-6"><h2>Formulario: Publicar Nueva Noticia</h2></div>;
const PublicarEstudio = () => <div className="p-6"><h2>Formulario: Cargar Estudio Científico</h2></div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        {/* Navbar Global Simple */}
        <nav className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-md">
          <h1 className="font-bold text-lg">IMTA - Laboratorio Enzo Levi</h1>
          <div className="space-x-4">
            <Link to="/" className="hover:underline">Inicio</Link>
            <Link to="/investigadores" className="hover:underline">Investigadores</Link>
            <Link to="/estudios" className="hover:underline">Estudios</Link>
            <Link to="/admin" className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-600">Admin</Link>
            <Link to="/investigador" className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">Investigador</Link>
          </div>
        </nav>

        {/* Renderizado de las rutas según la navegación */}
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/investigadores" element={<Investigadores />} />
          <Route path="/estudios" element={<Estudios />} />

          {/* Rutas Administrativas */}
          <Route path="/admin" element={<DashboardAdmin />} />
          <Route path="/admin/investigadores" element={<GestionInvestigadores />} />
          <Route path="/admin/comentarios" element={<GestionComentarios />} />
          <Route path="/admin/reportes" element={<Reportes />} />

          {/* Rutas del Investigador */}
          <Route path="/investigador" element={<DashboardInvestigador />} />
          <Route path="/investigador/publicar-noticia" element={<PublicarNoticia />} />
          <Route path="/investigador/publicar-estudio" element={<PublicarEstudio />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;