import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'admin@imta.mx') {
      onLoginSuccess({ name: 'Admin General', role: 'admin' });
      navigate('/admin');
    } else if (email === 'investigador@imta.mx') {
      onLoginSuccess({ name: 'Dr. Gómez', role: 'investigador' });
      navigate('/investigador');
    } else {
      onLoginSuccess({ name: 'Juan Consultor', role: 'consultor' });
      navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-grisCustom flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border-t-8 border-boio">
        <h2 className="text-2xl font-black text-cereza text-center mb-6">Control de Acceso</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-cereza mb-1">Correo Electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-boio" placeholder="ejemplo@imta.mx" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-cereza mb-1">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-boio" placeholder="••••••••" required />
          </div>
          <button type="submit" className="w-full bg-boio text-white font-bold py-2 rounded hover:bg-cereza transition-colors">Ingresar</button>
        </form>
        <div className="mt-6 text-center text-sm">
          <Link to="/registro" className="text-boio font-bold hover:underline">¿No tienes cuenta? Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
}