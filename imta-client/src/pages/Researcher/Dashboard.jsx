import { useEffect, useMemo, useState } from 'react';
import InstitutionLayout from '../../components/layout/InstitutionLayout';
import {
  createEstudio,
  createNoticia,
  fetchEstudios,
  fetchNoticias,
  formatApiError,
} from '../../services/api';

function formatDateInput() {
  return new Date().toISOString().split('T')[0];
}

export default function Dashboard({ user, onLogout }) {
  const researcherId = user?.investigador?.id ?? null;
  const [estudios, setEstudios] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '', success: '' });
  const [submittingStudy, setSubmittingStudy] = useState(false);
  const [submittingNews, setSubmittingNews] = useState(false);
  const [studyForm, setStudyForm] = useState({
    titulo: '',
    categoria: '',
    descripcion: '',
    investigador_id: researcherId ?? '',
    foto: null,
    documento: null,
  });
  const [newsForm, setNewsForm] = useState({
    titulo: '',
    contenido: '',
    fecha: formatDateInput(),
    investigador_id: researcherId ?? '',
    foto: null,
  });

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
  }, [researcherId]);

  const ownStudies = useMemo(
    () => estudios.filter((estudio) => Number(estudio.investigador_id) === Number(researcherId)),
    [estudios, researcherId],
  );
  const ownNews = useMemo(
    () => noticias.filter((noticia) => Number(noticia.investigador_id) === Number(researcherId)),
    [noticias, researcherId],
  );

  const handleStudySubmit = async (event) => {
    event.preventDefault();

    if (!researcherId) {
      setStatus((previous) => ({
        ...previous,
        error: 'Tu cuenta no está vinculada a un investigador. Contacta al administrador.',
        success: '',
      }));
      return;
    }

    if (!studyForm.documento) {
      setStatus((previous) => ({
        ...previous,
        error: 'Debes adjuntar un documento PDF o Word para publicar el estudio.',
        success: '',
      }));
      return;
    }

    setSubmittingStudy(true);
    setStatus((previous) => ({ ...previous, error: '', success: '' }));

    try {
      const response = await createEstudio({
        ...studyForm,
        investigador_id: researcherId,
      });
      setEstudios((previous) => [response.data, ...previous]);
      setStudyForm((previous) => ({
        ...previous,
        titulo: '',
        categoria: '',
        descripcion: '',
        investigador_id: researcherId,
        foto: null,
        documento: null,
      }));
      setStatus((previous) => ({ ...previous, success: response.message || 'Estudio publicado con éxito.' }));
    } catch (requestError) {
      setStatus((previous) => ({ ...previous, error: formatApiError(requestError), success: '' }));
    } finally {
      setSubmittingStudy(false);
    }
  };

  const handleNewsSubmit = async (event) => {
    event.preventDefault();

    if (!researcherId) {
      setStatus((previous) => ({
        ...previous,
        error: 'Tu cuenta no está vinculada a un investigador. Contacta al administrador.',
        success: '',
      }));
      return;
    }

    setSubmittingNews(true);
    setStatus((previous) => ({ ...previous, error: '', success: '' }));

    try {
      const response = await createNoticia({
        ...newsForm,
        investigador_id: researcherId,
      });
      setNoticias((previous) => [response.data, ...previous]);
      setNewsForm((previous) => ({
        ...previous,
        titulo: '',
        contenido: '',
        foto: null,
        fecha: formatDateInput(),
        investigador_id: researcherId,
      }));
      setStatus((previous) => ({ ...previous, success: response.message || 'Noticia publicada con éxito.' }));
    } catch (requestError) {
      setStatus((previous) => ({ ...previous, error: formatApiError(requestError), success: '' }));
    } finally {
      setSubmittingNews(false);
    }
  };

  return (
    <InstitutionLayout user={user} onLogout={onLogout}>
      <section className="section-head">
        <div>
          <h2>Panel del investigador</h2>
          <p>Publica nuevos estudios y noticias para mantener actualizado el repositorio institucional.</p>
        </div>
      </section>

      {status.loading ? <p className="status-box">Cargando recursos del panel...</p> : null}
      {status.error ? <p className="status-box">{status.error}</p> : null}
      {status.success ? <p className="status-box">{status.success}</p> : null}

      <section className="dashboard-grid">
        <article className="stat-card">
          <strong>{ownStudies.length}</strong>
          <span>Estudios en tu perfil</span>
        </article>
        <article className="stat-card">
          <strong>{ownNews.length}</strong>
          <span>Noticias asociadas</span>
        </article>
        <article className="stat-card">
          <strong>{ownStudies.length + ownNews.length}</strong>
          <span>Publicaciones totales</span>
        </article>
      </section>

      <div className="page-grid dashboard-band">
        <section className="panel management-panel">
          <div className="section-head">
            <div>
              <h2>Publicar estudio</h2>
              <p>Completa la información técnica del estudio y adjunta imagen de apoyo.</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleStudySubmit}>
            <p className="pill">Autor asignado automáticamente a tu perfil</p>

            <div className="form-grid form-grid--two">
              <div>
                <label htmlFor="study-title">Título</label>
                <input
                  id="study-title"
                  className="form-input"
                  value={studyForm.titulo}
                  onChange={(event) => setStudyForm((previous) => ({ ...previous, titulo: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="study-category">Categoría</label>
                <input
                  id="study-category"
                  className="form-input"
                  value={studyForm.categoria}
                  onChange={(event) => setStudyForm((previous) => ({ ...previous, categoria: event.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="study-description">Descripción</label>
              <textarea
                id="study-description"
                className="form-textarea"
                value={studyForm.descripcion}
                onChange={(event) => setStudyForm((previous) => ({ ...previous, descripcion: event.target.value }))}
                required
              />
            </div>

            <div>
              <label htmlFor="study-image">Imagen del estudio (opcional)</label>
              <input
                id="study-image"
                className="form-input"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(event) => setStudyForm((previous) => ({ ...previous, foto: event.target.files?.[0] ?? null }))}
              />
            </div>

            <div>
              <label htmlFor="study-document">Documento técnico (PDF/Word, obligatorio)</label>
              <input
                id="study-document"
                className="form-input"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => setStudyForm((previous) => ({ ...previous, documento: event.target.files?.[0] ?? null }))}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={submittingStudy}>
                {submittingStudy ? 'Publicando...' : 'Publicar estudio'}
              </button>
            </div>
          </form>
        </section>

        <section className="panel management-panel">
          <div className="section-head">
            <div>
              <h2>Publicar noticia</h2>
              <p>Comparte avances y actividades del laboratorio con fecha de publicación.</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleNewsSubmit}>
            <p className="pill">Autor asignado automáticamente a tu perfil</p>

            <div>
              <label htmlFor="news-title">Título</label>
              <input
                id="news-title"
                className="form-input"
                value={newsForm.titulo}
                onChange={(event) => setNewsForm((previous) => ({ ...previous, titulo: event.target.value }))}
                required
              />
            </div>

            <div>
              <label htmlFor="news-date">Fecha</label>
              <input
                id="news-date"
                className="form-input"
                type="date"
                value={newsForm.fecha}
                onChange={(event) => setNewsForm((previous) => ({ ...previous, fecha: event.target.value }))}
                required
              />
            </div>

            <div>
              <label htmlFor="news-content">Contenido</label>
              <textarea
                id="news-content"
                className="form-textarea"
                value={newsForm.contenido}
                onChange={(event) => setNewsForm((previous) => ({ ...previous, contenido: event.target.value }))}
                required
              />
            </div>

            <div>
              <label htmlFor="news-image">Imagen (opcional)</label>
              <input
                id="news-image"
                className="form-input"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(event) => setNewsForm((previous) => ({ ...previous, foto: event.target.files?.[0] ?? null }))}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={submittingNews}>
                {submittingNews ? 'Publicando...' : 'Publicar noticia'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </InstitutionLayout>
  );
}
