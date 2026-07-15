import { useNavigate, Link } from 'react-router-dom';

export default function RegistroConsultores() {
  const navigate = useNavigate();
  
  const handleRegister = (e) => {
    e.preventDefault();
    alert('¡Cuenta de consultor creada con éxito!');
    navigate('/login');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white flex items-center justify-center p-4">
      <form onSubmit={handleRegister} className="bg-white border border-grisCustom p-8 rounded-lg shadow-lg w-full max-w-lg space-y-4">
        <h2 className="text-2xl font-black text-cereza">Registro de Consultor Externo</h2>
        <div>
          <label className="block text-sm font-bold text-cereza mb-1">Nombre Completo *</label>
          <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-boio focus:outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-bold text-cereza mb-1">Correo Electrónico *</label>
          <input type="email" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-boio focus:outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-bold text-cereza mb-1">Contraseña *</label>
          <input type="password" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-boio focus:outline-none" required />
        </div>
        <button type="submit" className="w-full bg-cereza text-white font-bold py-2 rounded hover:bg-boio transition-colors">Finalizar Registro</button>
        <div className="text-center text-sm pt-2">
          <Link to="/login" className="text-boio font-bold hover:underline">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
}