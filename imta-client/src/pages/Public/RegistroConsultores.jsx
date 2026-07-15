import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { formatApiError, registerUser } from '../../services/api';

export default function RegistroConsultores({ user, onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [status, setStatus] = useState({ loading: false, error: '' });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: '' });

    try {
      const payload = await registerUser(form);
      onAuth(payload);
      navigate('/', { replace: true });
    } catch (requestError) {
      setStatus({ loading: false, error: formatApiError(requestError) });
      return;
    }

    setStatus({ loading: false, error: '' });
  };

  return (
    <AuthLayout
      title="Registro de consultores"
      subtitle="Crea tu cuenta para consultar estudios, noticias y participar en la sección de comentarios."
      topMessage="Alta de usuarios consultores externos"
      footerText="¿Ya tienes cuenta?"
      footerLink="/login"
      footerLinkLabel="Inicia sesión"
    >
      {status.error ? <p className="status-box">{status.error}</p> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-grid form-grid--two">
          <div>
            <label htmlFor="register-name">Nombre</label>
            <input
              id="register-name"
              className="form-input"
              value={form.nombre}
              onChange={(event) => setForm((previous) => ({ ...previous, nombre: event.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="register-lastname">Apellido paterno</label>
            <input
              id="register-lastname"
              className="form-input"
              value={form.apellido_paterno}
              onChange={(event) => setForm((previous) => ({ ...previous, apellido_paterno: event.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-second-lastname">Apellido materno (opcional)</label>
          <input
            id="register-second-lastname"
            className="form-input"
            value={form.apellido_materno}
            onChange={(event) => setForm((previous) => ({ ...previous, apellido_materno: event.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="register-email">Correo electrónico</label>
          <input
            id="register-email"
            type="email"
            className="form-input"
            value={form.email}
            onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
            required
          />
        </div>

        <div className="form-grid form-grid--two">
          <div>
            <label htmlFor="register-password">Contraseña</label>
            <input
              id="register-password"
              type="password"
              className="form-input"
              value={form.password}
              onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
              required
              minLength={8}
            />
          </div>
          <div>
            <label htmlFor="register-password-confirmation">Confirmar contraseña</label>
            <input
              id="register-password-confirmation"
              type="password"
              className="form-input"
              value={form.password_confirmation}
              onChange={(event) => setForm((previous) => ({ ...previous, password_confirmation: event.target.value }))}
              required
              minLength={8}
            />
          </div>
        </div>

        <button type="submit" className="primary-button" disabled={status.loading}>
          {status.loading ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>
    </AuthLayout>
  );
}
