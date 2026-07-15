import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import InstitutionLayout from '../../components/layout/InstitutionLayout';
import { fetchInvestigadores, formatApiError, getDisplayName, resolveBackendUrl } from '../../services/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80';

function truncateText(value, maxLength = 190) {
  if (!value) {
    return '';
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

export default function Investigadores({ user, onLogout }) {
  const [investigadores, setInvestigadores] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState({ loading: true, error: '' });

  useEffect(() => {
    let mounted = true;

    fetchInvestigadores()
      .then((data) => {
        if (!mounted) {
          return;
        }

        setInvestigadores(Array.isArray(data) ? data : []);
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
      return investigadores;
    }

    return investigadores.filter((investigador) => [
      getDisplayName(investigador.user),
      investigador.area_investigacion,
      investigador.nivel_academico,
      investigador.semblanza,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query)));
  }, [investigadores, search]);

  return (
    <InstitutionLayout user={user} onLogout={onLogout}>
      <section className="section-head">
        <div>
          <h2>Investigadores del laboratorio</h2>
          <p>Conoce al equipo académico y sus principales áreas de investigación.</p>
        </div>
      </section>

      <section className="list-panel">
        <div className="feature-card__body search-group">
          <label htmlFor="investigadores-search">Buscar investigador</label>
          <input
            id="investigadores-search"
            className="search-input"
            type="search"
            placeholder="Nombre, área o nivel académico..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </section>

      {status.loading ? <p className="status-box">Cargando investigadores...</p> : null}
      {status.error ? <p className="status-box">{status.error}</p> : null}

      {!status.loading && filtered.length === 0 ? (
        <article className="empty-state">
          <p>No se encontraron investigadores con los filtros actuales.</p>
        </article>
      ) : (
        <div className="cards-grid">
          {filtered.map((investigador) => (
            <article key={investigador.id} className="profile-card">
              <div className="profile-card__media">
                <img src={resolveBackendUrl(investigador.foto) || FALLBACK_IMAGE} alt={getDisplayName(investigador.user)} />
              </div>
              <div className="profile-card__body">
                <span className="tag">{investigador.nivel_academico || 'Investigador'}</span>
                <h3>{getDisplayName(investigador.user)}</h3>
                <p><strong>Área:</strong> {investigador.area_investigacion || 'No especificada'}</p>
                <p>{truncateText(investigador.semblanza)}</p>
                <div className="meta-row">
                  <Link className="solid-link" to={`/investigadores/${investigador.id}`}>Ver perfil</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </InstitutionLayout>
  );
}
