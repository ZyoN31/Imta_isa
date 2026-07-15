import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function DetalleEstudio({ user }) {
  const [comentarios, setComentarios] = useState([
    { id: 1, usuario: 'Ing. Carlos Mendoza', texto: 'Excelente validación empírica en el laboratorio.', fecha: '2026-07-12' }
  ]);
  const [nuevoComentario, setNuevoComentario] = useState('');

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;
    setComentarios([...comentarios, { id: comentarios.length + 1, usuario: user?.name || 'Anónimo', texto: nuevoComentario, fecha: '2026-07-15' }]);
    setNuevoComentario('');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white p-6 max-w-4xl mx-auto">
      <Link to="/" className="text-boio font-bold text-sm hover:underline">← Volver al inicio</Link>
      <article className="border border-grisCustom rounded-lg p-6 bg-white shadow-sm my-4">
        <span className="bg-boio text-white px-3 py-1 text-xs font-bold rounded">Estudio Técnico</span>
        <h2 className="text-2xl font-black text-cereza mt-2">Análisis de Flujo en Canales Abiertos</h2>
        <p className="text-gray-700 mt-4 text-justify">Resultados experimentales obtenidos en el canal de pendiente variable del laboratorio Enzo Levi del IMTA...</p>
      </article>

      <section className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-bold text-cereza mb-4">Comentarios ({comentarios.length})</h3>
        <div className="space-y-4 mb-6">
          {comentarios.map(c => (
            <div key={c.id} className="bg-grisCustom bg-opacity-30 p-4 rounded-lg border border-grisCustom">
              <div className="flex justify-between text-xs mb-1"><span className="font-bold text-cereza">{c.usuario}</span><span>{c.fecha}</span></div>
              <p className="text-sm text-gray-700">{c.texto}</p>
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea rows="3" value={nuevoComentario} onChange={e => setNuevoComentario(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm focus:border-boio focus:outline-none" placeholder="Aporta tus observaciones..." required />
            <button type="submit" className="bg-boio text-white px-4 py-2 rounded text-sm font-bold hover:bg-cereza">Enviar Comentario</button>
          </form>
        ) : (
          <div className="bg-grisCustom p-4 rounded text-center border border-dashed border-gray-400">
            <p className="text-sm text-gray-600">Para comentar, <Link to="/login" className="text-boio font-bold underline">inicia sesión</Link> o <Link to="/registro" className="text-boio font-bold underline">regístrate</Link>.</p>
          </div>
        )}
      </section>
    </div>
  );
}