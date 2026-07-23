import { useState } from 'react';
import InstitutionLayout from '../../components/layout/InstitutionLayout';
import { formatApiError, resolveBackendUrl, updateCurrentUser } from '../../services/api';

export default function PerfilConsultor({ user, onLogout, onUserUpdate }) {
  const [form, setForm] = useState({
    nombre: user?.nombre ?? '',
    apellido_paterno: user?.apellido_paterno ?? '',
    apellido_materno: user?.apellido_materno ?? '',
    email: user?.email ?? '',
    password: '',
    password_confirmation: '',
    foto: null,
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password || form.password_confirmation) {
      if (form.password !== form.password_confirmation) {
        setStatus({ loading: false, error: 'La confirmación de contraseña no coincide.', success: '' });
        return;
      }
    }

    setStatus({ loading: true, error: '', success: '' });

    try {
      const payload = {
        nombre: form.nombre,
        apellido_paterno: form.apellido_paterno,
        apellido_materno: form.apellido_materno,
        email: form.email,
        foto: form.foto,
      };

      if (form.password) {
        payload.password = form.password;
        payload.password_confirmation = form.password_confirmation;
      }

      const response = await updateCurrentUser(payload);
      onUserUpdate(response.data);
      setForm({
        nombre: response.data?.nombre ?? form.nombre,
        apellido_paterno: response.data?.apellido_paterno ?? form.apellido_paterno,
        apellido_materno: response.data?.apellido_materno ?? form.apellido_materno,
        email: response.data?.email ?? form.email,
        password: '',
        password_confirmation: '',
        foto: null,
      });
      setStatus({ loading: false, error: '', success: response.message || 'Perfil actualizado con éxito.' });
    } catch (requestError) {
      setStatus({ loading: false, error: formatApiError(requestError), success: '' });
    }
  };

  return (
    <InstitutionLayout user={user} onLogout={onLogout}>
      <section className="section-head">
        <div>
          <h2>Mi perfil</h2>
          <p>Actualiza tus datos personales y credenciales de acceso.</p>
        </div>
      </section>

      {status.error ? <p className="status-box">{status.error}</p> : null}
      {status.success ? <p className="status-box">{status.success}</p> : null}

      <section className="panel management-panel">
        <div className="profile-banner">
          <div className="profile-banner__avatar">
            {user?.foto ? (
              <img src={resolveBackendUrl(user.foto)} alt={user?.nombre || 'Foto de perfil'} />
            ) : (
              <span>{(user?.nombre || 'U').charAt(0)}</span>
            )}
          </div>
          <div>
            <h3>{user?.nombre} {user?.apellido_paterno}</h3>
            <p>Foto de perfil opcional y datos editables.</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-grid form-grid--two">
            <div>
              <label htmlFor="profile-name">Nombre</label>
              <input
                id="profile-name"
                className="form-input"
                value={form.nombre}
                onChange={(event) => setForm((previous) => ({ ...previous, nombre: event.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="profile-lastname">Apellido paterno</label>
              <input
                id="profile-lastname"
                className="form-input"
                value={form.apellido_paterno}
                onChange={(event) => setForm((previous) => ({ ...previous, apellido_paterno: event.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-grid form-grid--two">
            <div>
              <label htmlFor="profile-second-lastname">Apellido materno</label>
              <input
                id="profile-second-lastname"
                className="form-input"
                value={form.apellido_materno}
                onChange={(event) => setForm((previous) => ({ ...previous, apellido_materno: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="profile-email">Correo electrónico</label>
              <input
                id="profile-email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-grid form-grid--two">
            <div>
              <label htmlFor="profile-password">Nueva contraseña (opcional)</label>
              <input
                id="profile-password"
                type="password"
                autoComplete="new-password"
                className="form-input"
                value={form.password}
                onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
                minLength={8}
              />
            </div>
            <div>
              <label htmlFor="profile-password-confirmation">Confirmar contraseña</label>
              <input
                id="profile-password-confirmation"
                type="password"
                autoComplete="new-password"
                className="form-input"
                value={form.password_confirmation}
                onChange={(event) => setForm((previous) => ({ ...previous, password_confirmation: event.target.value }))}
                minLength={8}
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-photo">Foto de perfil (opcional)</label>
            <input
              id="profile-photo"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="form-input"
              onChange={(event) => setForm((previous) => ({ ...previous, foto: event.target.files?.[0] ?? null }))}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={status.loading}>
              {status.loading ? 'Guardando...' : 'Actualizar perfil'}
            </button>
          </div>
        </form>
      </section>
    </InstitutionLayout>
  );
}
