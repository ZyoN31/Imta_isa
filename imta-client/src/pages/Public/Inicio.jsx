import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import InstitutionLayout from '../../components/layout/InstitutionLayout';
import {
  fetchEstudios,
  fetchInvestigadores,
  fetchNoticias,
  formatApiError,
  resolveBackendUrl,
} from '../../services/api';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=80';

function truncateText(value, maxLength = 170) {
  if (!value) {
    return '';
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function formatDate(value) {
  if (!value) {
    return 'Fecha no disponible';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-MX');
}

export default function Inicio({ user, onLogout }) {
  const [estudios, setEstudios] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [investigadores, setInvestigadores] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    Promise.all([fetchEstudios(), fetchNoticias(), fetchInvestigadores()])
      .then(([estudiosData, noticiasData, investigadoresData]) => {
        if (!mounted) {
          return;
        }

        setEstudios(Array.isArray(estudiosData) ? estudiosData : []);
        setNoticias(Array.isArray(noticiasData) ? noticiasData : []);
        setInvestigadores(Array.isArray(investigadoresData) ? investigadoresData : []);
      })
      .catch((requestError) => {
        if (!mounted) {
          return;
        }

        setError(formatApiError(requestError));
      });

    return () => {
      mounted = false;
    };
  }, []);

  const estudiosDestacados = useMemo(() => estudios.slice(0, 3), [estudios]);
  const noticiasRecientes = useMemo(() => noticias.slice(0, 3), [noticias]);

  return (
    <InstitutionLayout user={user} onLogout={onLogout}>
      <section className="hero-panel">
        <div className="hero-panel__grid">
          <div className="hero-panel__copy">
            <span className="eyebrow">Laboratorio Enzo Levi</span>
            <h2 className="page-title">Un poco del Laboratorio Enzo Levi</h2>
            <p className="page-intro">
              Plataforma digital para divulgar estudios científicos, noticias técnicas y el trabajo del equipo de investigación del IMTA.
            </p>
            <div className="hero-stats">
              <article className="hero-stat">
                <strong>{estudios.length}</strong>
                <span>Estudios publicados</span>
              </article>
              <article className="hero-stat">
                <strong>{noticias.length}</strong>
                <span>Noticias técnicas</span>
              </article>
              <article className="hero-stat">
                <strong>{investigadores.length}</strong>
                <span>Investigadores activos</span>
              </article>
            </div>
          </div>

          <div className="hero-panel__media">
            <img src={HERO_IMAGE} alt="Instalaciones del laboratorio de hidráulica" />
            <div className="hero-panel__badge">
              <strong>Repositorio administrativo y técnico</strong>
              <p>Consulta publicaciones y participa con comentarios.</p>
            </div>
          </div>
        </div>
      </section>

      {error ? <p className="status-box">{error}</p> : null}

      <section className="section-head">
        <div>
          <h2>Estudios destacados</h2>
          <p>Resultados recientes de modelos físicos y evaluaciones hidráulicas.</p>
        </div>
        <Link className="solid-link" to="/estudios">Ver todos</Link>
      </section>

      <div className="cards-grid">
        {estudiosDestacados.map((estudio) => (
          <article key={estudio.id} className="feature-card">
            <div className="feature-card__cover">
              <img src={resolveBackendUrl(estudio.foto) || HERO_IMAGE} alt={estudio.titulo} />
            </div>
            <div className="feature-card__body">
              <span className="tag">{estudio.categoria || 'Estudio'}</span>
              <h3>{estudio.titulo}</h3>
              <p>{truncateText(estudio.descripcion)}</p>
              <div className="meta-row">
                <Link className="ghost-link" to={`/estudios/${estudio.id}`}>Leer más</Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="section-head">
        <div>
          <h2>Noticias recientes</h2>
          <p>Actualizaciones institucionales y avances del laboratorio.</p>
        </div>
        <Link className="solid-link" to="/noticias">Ir a noticias</Link>
      </section>

      <div className="cards-grid">
        {noticiasRecientes.map((noticia) => (
          <article key={noticia.id} className="story-card">
            <div className="story-card__cover">
              <img src={resolveBackendUrl(noticia.foto) || HERO_IMAGE} alt={noticia.titulo} />
            </div>
            <div className="story-card__body">
              <span className="pill">{formatDate(noticia.fecha || noticia.created_at)}</span>
              <h3>{noticia.titulo}</h3>
              <p>{truncateText(noticia.contenido)}</p>
              <div className="meta-row">
                <Link className="ghost-link" to={`/noticias/${noticia.id}`}>Ver detalle</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </InstitutionLayout>
  );
}
