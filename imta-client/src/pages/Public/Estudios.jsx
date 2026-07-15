import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import InstitutionLayout from '../../components/layout/InstitutionLayout';
import { fetchEstudios, formatApiError, resolveBackendUrl } from '../../services/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80';

function truncateText(value, maxLength = 220) {
  if (!value) {
    return '';
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

export default function Estudios({ user, onLogout }) {
  const [estudios, setEstudios] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState({ loading: true, error: '' });

  useEffect(() => {
    let mounted = true;

    fetchEstudios()
      .then((data) => {
        if (!mounted) {
          return;
        }

        setEstudios(Array.isArray(data) ? data : []);
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
      return estudios;
    }

    return estudios.filter((estudio) => [estudio.titulo, estudio.categoria, estudio.descripcion]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query)));
  }, [estudios, search]);

  return (
    <InstitutionLayout user={user} onLogout={onLogout}>
      <section className="section-head">
        <div>
          <h2>Estudios científicos</h2>
          <p>Consulta publicaciones técnicas del laboratorio, filtradas por título, categoría o contenido.</p>
        </div>
      </section>

      <section className="list-panel">
        <div className="feature-card__body search-group">
          <label htmlFor="estudios-search">Buscar estudio</label>
          <input
            id="estudios-search"
            className="search-input"
            type="search"
            placeholder="Ej. flujo, modelación, canales..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </section>

      {status.loading ? <p className="status-box">Cargando estudios...</p> : null}
      {status.error ? <p className="status-box">{status.error}</p> : null}

      {!status.loading && filtered.length === 0 ? (
        <article className="empty-state">
          <p>No se encontraron estudios con los filtros actuales.</p>
        </article>
      ) : (
        <div className="cards-grid">
          {filtered.map((estudio) => (
            <article key={estudio.id} className="feature-card">
              <div className="feature-card__cover">
                <img src={resolveBackendUrl(estudio.foto) || FALLBACK_IMAGE} alt={estudio.titulo} />
              </div>
              <div className="feature-card__body">
                <div className="tag-row">
                  <span className="tag">{estudio.categoria || 'Estudio'}</span>
                  <span className="pill">
                    {estudio.investigador?.user?.nombre ? `Autor: ${estudio.investigador.user.nombre}` : 'IMTA'}
                  </span>
                </div>
                <h3>{estudio.titulo}</h3>
                <p>{truncateText(estudio.descripcion)}</p>
                <div className="meta-row">
                  <Link className="solid-link" to={`/estudios/${estudio.id}`}>Ver detalle</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </InstitutionLayout>
  );
}
