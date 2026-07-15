import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { formatApiError, login } from '../../services/api';

function resolveRouteByRole(role) {
  if (role === 'administrador') {
    return '/admin';
  }

  if (role === 'investigador') {
    return '/investigador';
  }

  return '/';
}

export default function Login({ user, onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '' });

  if (user) {
    return <Navigate to={resolveRouteByRole(user.rol)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: '' });

    try {
      const payload = await login(form);
      onAuth(payload);
      navigate(resolveRouteByRole(payload.user?.rol), { replace: true });
    } catch (requestError) {
      setStatus({ loading: false, error: formatApiError(requestError) });
      return;
    }

    setStatus({ loading: false, error: '' });
  };

  return (
    <AuthLayout
      title="Control de acceso"
      subtitle="Ingresa con tu cuenta para comentar publicaciones y acceder a los módulos de gestión."
      topMessage="Sistema Web Administrativo · Laboratorio de Hidráulica del IMTA"
      footerText="¿No tienes cuenta?"
      footerLink="/registro"
      footerLinkLabel="Regístrate aquí"
    >
      {status.error ? <p className="status-box">{status.error}</p> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label htmlFor="login-email">Correo electrónico</label>
        <input
          id="login-email"
          type="email"
          className="form-input"
          placeholder="usuario@imta.mx"
          value={form.email}
          onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
          required
        />

        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          className="form-input"
          placeholder="••••••••"
          value={form.password}
          onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
          required
        />

        <button type="submit" className="primary-button" disabled={status.loading}>
          {status.loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>
    </AuthLayout>
  );
}
