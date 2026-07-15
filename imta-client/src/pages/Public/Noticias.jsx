import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import InstitutionLayout from '../../components/layout/InstitutionLayout';
import { fetchNoticias, formatApiError, resolveBackendUrl } from '../../services/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?auto=format&fit=crop&w=1200&q=80';

function truncateText(value, maxLength = 210) {
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

export default function Noticias({ user, onLogout }) {
  const [noticias, setNoticias] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState({ loading: true, error: '' });

  useEffect(() => {
    let mounted = true;

    fetchNoticias()
      .then((data) => {
        if (!mounted) {
          return;
        }

        setNoticias(Array.isArray(data) ? data : []);
        setStatus({ loading: false, error: '' });
      })
      .catch((requestError) => {
        if (!mounted) {
          return;
        }

        setStatus({ loading: false, error: formatApiError(requestError) });
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return noticias;
    }

    return noticias.filter((noticia) => [noticia.titulo, noticia.contenido]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query)));
  }, [noticias, search]);

  return (
    <InstitutionLayout user={user} onLogout={onLogout}>
      <section className="section-head">
        <div>
          <h2>Noticias del laboratorio</h2>
          <p>Publicaciones institucionales con avances, eventos y resultados de investigación.</p>
        </div>
      </section>

      <section className="list-panel">
        <div className="feature-card__body search-group">
          <label htmlFor="noticias-search">Buscar noticia</label>
          <input
            id="noticias-search"
            className="search-input"
            type="search"
            placeholder="Título o contenido..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </section>

      {status.loading ? <p className="status-box">Cargando noticias...</p> : null}
      {status.error ? <p className="status-box">{status.error}</p> : null}

      {!status.loading && filtered.length === 0 ? (
        <article className="empty-state">
          <p>No se encontraron noticias con los filtros actuales.</p>
        </article>
      ) : (
        <div className="cards-grid">
          {filtered.map((noticia) => (
            <article key={noticia.id} className="story-card">
              <div className="story-card__cover">
                <img src={resolveBackendUrl(noticia.foto) || FALLBACK_IMAGE} alt={noticia.titulo} />
              </div>
              <div className="story-card__body">
                <div className="meta-row">
                  <span className="badge">Noticia</span>
                  <span className="pill">{formatDate(noticia.fecha || noticia.created_at)}</span>
                </div>
                <h3>{noticia.titulo}</h3>
                <p>{truncateText(noticia.contenido)}</p>
                <div className="meta-row">
                  <Link className="solid-link" to={`/noticias/${noticia.id}`}>Ver detalle</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </InstitutionLayout>
  );
}
