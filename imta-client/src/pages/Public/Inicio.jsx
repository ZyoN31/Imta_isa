import { Link } from 'react-router-dom';

export default function Inicio({ user, onLogout }) {
  const publicacionesDestacadas = [
    { id: 1, tipo: 'Estudio', titulo: 'Análisis de Flujo en Canales Abiertos', autor: 'Dr. Roberto Gómez', fecha: '2026-07-10' },
    { id: 2, tipo: 'Noticia', titulo: 'Renovación de Equipamiento en el Laboratorio Enzo Levi', autor: 'Mtra. Sofía Pérez', fecha: '2026-07-14' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-white">
      {/* Hero / Banner Principal */}
      <section className="bg-grisCustom p-12 text-center border-b border-gray-200">
        <h2 className="text-3xl font-black text-cereza mb-4">Repositorio Digital de Conocimiento Hidráulico</h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Espacio dedicado a la divulgación técnica, artículos científicos y noticias relevantes desarrolladas en el Laboratorio Enzo Levi.
        </p>
      </section>

      {/* Listado General */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {publicacionesDestacadas.map((pub) => (
          <div key={pub.id} className="border border-grisCustom rounded-lg p-5 shadow-sm hover:shadow-md flex flex-col justify-between bg-white">
            <div>
              <span className={`inline-block px-3 py-1 rounded text-xs font-bold mb-3 ${pub.tipo === 'Estudio' ? 'bg-boio text-white' : 'bg-ramei text-cereza'}`}>
                {pub.tipo}
              </span>
              <h3 className="text-xl font-bold text-cereza mb-2">{pub.titulo}</h3>
              <p className="text-sm text-gray-600">Por: {pub.autor}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-grisCustom flex justify-between items-center">
              <span className="text-xs text-gray-400">{pub.fecha}</span>
              <Link to={`/estudio/${pub.id}`} className="text-boio font-bold text-sm hover:underline">Ver detalles →</Link>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}