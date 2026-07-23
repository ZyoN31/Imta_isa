import { useEffect, useMemo, useState } from 'react';
import InstitutionLayout from '../../components/layout/InstitutionLayout';
import {
  deleteEstudio,
  deleteNoticia,
  fetchEstudios,
  fetchNoticias,
  formatApiError,
  getDisplayName,
  updateEstudio,
  updateNoticia,
} from '../../services/api';

function formatDate(value) {
  if (!value) {
    return 'Fecha no disponible';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-MX');
}

export default function MisPublicaciones({ user, onLogout }) {
  const researcherId = user?.investigador_id ?? user?.investigador?.id ?? null;
  const [estudios, setEstudios] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '', success: '' });
  const [editingEstudio, setEditingEstudio] = useState(null);
  const [editingNoticia, setEditingNoticia] = useState(null);
  const [editEstudioForm, setEditEstudioForm] = useState({
    titulo: '',
    categoria: '',
    descripcion: '',
    foto: null,
    documento: null,
  });
  const [editNoticiaForm, setEditNoticiaForm] = useState({
    titulo: '',
    contenido: '',
    fecha: '',
    foto: null,
  });
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('estudios');

  useEffect(() => {
    let mounted = true;

    Promise.all([fetchEstudios(), fetchNoticias()])
      .then(([estudiosData, noticiasData]) => {
        if (!mounted) {
          return;
        }

        setEstudios(Array.isArray(estudiosData) ? estudiosData : []);
        setNoticias(Array.isArray(noticiasData) ? noticiasData : []);
        setStatus({ loading: false, error: '', success: '' });
      })
      .catch((requestError) => {
        if (!mounted) {
          return;
        }

        setStatus({ loading: false, error: formatApiError(requestError), success: '' });
      });

    return () => {
      mounted = false;
    };
  }, []);

  const ownEstudios = useMemo(
    () => estudios.filter((estudio) => Number(estudio.investigador_id) === Number(researcherId)),
    [estudios, researcherId],
  );

  const ownNoticias = useMemo(
    () => noticias.filter((noticia) => Number(noticia.investigador_id) === Number(researcherId)),
    [noticias, researcherId],
  );

  const startEditEstudio = (estudio) => {
    setEditingEstudio(estudio);
    setEditingNoticia(null);
    setEditEstudioForm({
      titulo: estudio.titulo,
      categoria: estudio.categoria,
      descripcion: estudio.descripcion,
      foto: null,
      documento: null,
    });
    setStatus({ loading: false, error: '', success: '' });
  };

  const cancelEditEstudio = () => {
    setEditingEstudio(null);
    setEditEstudioForm({ titulo: '', categoria: '', descripcion: '', foto: null, documento: null });
  };

  const startEditNoticia = (noticia) => {
    setEditingNoticia(noticia);
    setEditingEstudio(null);
    setEditNoticiaForm({
      titulo: noticia.titulo,
      contenido: noticia.contenido,
      fecha: noticia.fecha || '',
      foto: null,
    });
    setStatus({ loading: false, error: '', success: '' });
  };

  const cancelEditNoticia = () => {
    setEditingNoticia(null);
    setEditNoticiaForm({ titulo: '', contenido: '', fecha: '', foto: null });
  };

  const handleDeleteEstudio = async (estudioId) => {
    setStatus({ loading: false, error: '', success: '' });

    try {
      const response = await deleteEstudio(estudioId);
      setEstudios((previous) => previous.filter((item) => item.id !== estudioId));
      setStatus({ loading: false, error: '', success: response.message || 'Estudio eliminado correctamente.' });
    } catch (requestError) {
      setStatus({ loading: false, error: formatApiError(requestError), success: '' });
    }
  };

  const handleDeleteNoticia = async (noticiaId) => {
    setStatus({ loading: false, error: '', success: '' });

    try {
      const response = await deleteNoticia(noticiaId);
      setNoticias((previous) => previous.filter((item) => item.id !== noticiaId));
      setStatus({ loading: false, error: '', success: response.message || 'Noticia eliminada correctamente.' });
    } catch (requestError) {
      setStatus({ loading: false, error: formatApiError(requestError), success: '' });
    }
  };

  const handleUpdateEstudio = async () => {
    if (!editingEstudio) {
      return;
    }

    setSaving(true);
    setStatus({ loading: false, error: '', success: '' });

    try {
      const payload = {
        titulo: editEstudioForm.titulo,
        categoria: editEstudioForm.categoria,
        descripcion: editEstudioForm.descripcion,
      };

      if (editEstudioForm.foto) {
        payload.foto = editEstudioForm.foto;
      }

      if (editEstudioForm.documento) {
        payload.documento = editEstudioForm.documento;
      }

      const response = await updateEstudio(editingEstudio.id, payload);
      setEstudios((previous) => previous.map((item) => (item.id === editingEstudio.id ? response.data : item)));
      setStatus({ loading: false, error: '', success: response.message || 'Estudio actualizado correctamente.' });
      cancelEditEstudio();
    } catch (requestError) {
      setStatus({ loading: false, error: formatApiError(requestError), success: '' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNoticia = async () => {
    if (!editingNoticia) {
      return;
    }

    setSaving(true);
    setStatus({ loading: false, error: '', success: '' });

    try {
      const payload = {
        titulo: editNoticiaForm.titulo,
        contenido: editNoticiaForm.contenido,
        fecha: editNoticiaForm.fecha,
      };

      if (editNoticiaForm.foto) {
        payload.foto = editNoticiaForm.foto;
      }

      const response = await updateNoticia(editingNoticia.id, payload);
      setNoticias((previous) => previous.map((item) => (item.id === editingNoticia.id ? response.data : item)));
      setStatus({ loading: false, error: '', success: response.message || 'Noticia actualizada correctamente.' });
      cancelEditNoticia();
    } catch (requestError) {
      setStatus({ loading: false, error: formatApiError(requestError), success: '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <InstitutionLayout user={user} onLogout={onLogout}>
      <section className="section-head">
        <div>
          <h2>Mis publicaciones</h2>
          <p>Administra tus propias noticias y estudios. Solo podrás editar o eliminar lo que tú hayas publicado.</p>
        </div>
      </section>

      {status.loading ? <p className="status-box">Cargando tus publicaciones...</p> : null}
      {status.error ? <p className="status-box">{status.error}</p> : null}
      {status.success ? <p className="status-box">{status.success}</p> : null}

      <section className="tab-bar">
        <button
          type="button"
          className={`tab-button ${activeSection === 'estudios' ? 'is-active' : ''}`}
          onClick={() => {
            setActiveSection('estudios');
            setEditingNoticia(null);
          }}
        >
          Estudios
        </button>
        <button
          type="button"
          className={`tab-button ${activeSection === 'noticias' ? 'is-active' : ''}`}
          onClick={() => {
            setActiveSection('noticias');
            setEditingEstudio(null);
          }}
        >
          Noticias
        </button>
      </section>

      <section className="page-grid dashboard-band">
        <article className="management-panel">
          <div className="section-head">
            <div>
              <h3>{activeSection === 'estudios' ? 'Estudios propios' : 'Noticias propias'}</h3>
              <p>
                {activeSection === 'estudios'
                  ? 'Revisa, edita o elimina los estudios publicados por tu cuenta.'
                  : 'Administra las noticias que has publicado. Solo tú puedes modificarlas.'}
              </p>
            </div>
          </div>

          {activeSection === 'estudios' ? (
            ownEstudios.length === 0 ? (
              <article className="empty-state">
                <p>No hay estudios publicados por tu perfil aún.</p>
              </article>
            ) : (
              ownEstudios.map((estudio) => (
                <article className="list-card" key={estudio.id}>
                  <div className="list-card__content">
                    <strong>{estudio.titulo}</strong>
                    <span>{estudio.categoria}</span>
                    <p>{estudio.descripcion}</p>
                    <small>Publicado por {getDisplayName(estudio.investigador?.user)} · {formatDate(estudio.created_at || estudio.fecha)}</small>
                  </div>
                  <div className="list-card__actions">
                    <button type="button" className="ghost-button" onClick={() => startEditEstudio(estudio)}>
                      Editar
                    </button>
                    <button type="button" className="danger-button" onClick={() => handleDeleteEstudio(estudio.id)}>
                      Eliminar
                    </button>
                  </div>
                </article>
              ))
            )
          ) : (
            ownNoticias.length === 0 ? (
              <article className="empty-state">
                <p>No hay noticias publicadas por tu perfil aún.</p>
              </article>
            ) : (
              ownNoticias.map((noticia) => (
                <article className="list-card" key={noticia.id}>
                  <div className="list-card__content">
                    <strong>{noticia.titulo}</strong>
                    <p>{noticia.contenido}</p>
                    <small>Publicado por {getDisplayName(noticia.investigador?.user)} · {formatDate(noticia.fecha)}</small>
                  </div>
                  <div className="list-card__actions">
                    <button type="button" className="ghost-button" onClick={() => startEditNoticia(noticia)}>
                      Editar
                    </button>
                    <button type="button" className="danger-button" onClick={() => handleDeleteNoticia(noticia.id)}>
                      Eliminar
                    </button>
                  </div>
                </article>
              ))
            )
          )}

          {activeSection === 'estudios' && editingEstudio ? (
            <section className="panel edit-panel">
              <div className="section-head">
                <h3>Editar estudio</h3>
              </div>
              <form className="form-grid" onSubmit={(event) => { event.preventDefault(); handleUpdateEstudio(); }}>
                <div className="form-grid form-grid--two">
                  <div>
                    <label htmlFor="edit-study-title">Título</label>
                    <input
                      id="edit-study-title"
                      className="form-input"
                      value={editEstudioForm.titulo}
                      onChange={(event) => setEditEstudioForm((previous) => ({ ...previous, titulo: event.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-study-category">Categoría</label>
                    <input
                      id="edit-study-category"
                      className="form-input"
                      value={editEstudioForm.categoria}
                      onChange={(event) => setEditEstudioForm((previous) => ({ ...previous, categoria: event.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-study-description">Descripción</label>
                  <textarea
                    id="edit-study-description"
                    className="form-textarea"
                    value={editEstudioForm.descripcion}
                    onChange={(event) => setEditEstudioForm((previous) => ({ ...previous, descripcion: event.target.value }))}
                    required
                  />
                </div>

                <div className="form-grid form-grid--two">
                  <div>
                    <label htmlFor="edit-study-image">Actualizar imagen (opcional)</label>
                    <input
                      id="edit-study-image"
                      className="form-input"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(event) => setEditEstudioForm((previous) => ({ ...previous, foto: event.target.files?.[0] ?? null }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-study-document">Actualizar documento (opcional)</label>
                    <input
                      id="edit-study-document"
                      className="form-input"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(event) => setEditEstudioForm((previous) => ({ ...previous, documento: event.target.files?.[0] ?? null }))}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-button" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button type="button" className="ghost-button" onClick={cancelEditEstudio} disabled={saving}>
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          ) : null}

          {activeSection === 'noticias' && editingNoticia ? (
            <section className="panel edit-panel">
              <div className="section-head">
                <h3>Editar noticia</h3>
              </div>
              <form className="form-grid" onSubmit={(event) => { event.preventDefault(); handleUpdateNoticia(); }}>
                <div>
                  <label htmlFor="edit-news-title">Título</label>
                  <input
                    id="edit-news-title"
                    className="form-input"
                    value={editNoticiaForm.titulo}
                    onChange={(event) => setEditNoticiaForm((previous) => ({ ...previous, titulo: event.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-news-content">Contenido</label>
                  <textarea
                    id="edit-news-content"
                    className="form-textarea"
                    value={editNoticiaForm.contenido}
                    onChange={(event) => setEditNoticiaForm((previous) => ({ ...previous, contenido: event.target.value }))}
                    required
                  />
                </div>

                <div className="form-grid form-grid--two">
                  <div>
                    <label htmlFor="edit-news-date">Fecha de publicación</label>
                    <input
                      id="edit-news-date"
                      className="form-input"
                      type="date"
                      value={editNoticiaForm.fecha}
                      onChange={(event) => setEditNoticiaForm((previous) => ({ ...previous, fecha: event.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-news-image">Actualizar imagen (opcional)</label>
                    <input
                      id="edit-news-image"
                      className="form-input"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(event) => setEditNoticiaForm((previous) => ({ ...previous, foto: event.target.files?.[0] ?? null }))}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-button" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button type="button" className="ghost-button" onClick={cancelEditNoticia} disabled={saving}>
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          ) : null}
        </article>
      </section>
    </InstitutionLayout>
  );
}
