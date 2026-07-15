import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import InstitutionLayout from '../../components/layout/InstitutionLayout';
import { fetchInvestigador, formatApiError, getDisplayName, resolveBackendUrl } from '../../services/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80';

export default function DetalleInvestigador({ user, onLogout }) {
  const { id } = useParams();
  const [investigador, setInvestigador] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: '' });

  useEffect(() => {
    let mounted = true;

    fetchInvestigador(id)
      .then((data) => {
        if (!mounted) {
          return;
        }

        setInvestigador(data);
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
  }, [id]);

  const formatDate = (value) => {
    if (!value) {
      return 'Fecha no disponible';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-MX');
  };

  return (
    <InstitutionLayout user={user} onLogout={onLogout}>
      {status.loading ? <p className="status-box">Cargando perfil del investigador...</p> : null}
      {status.error ? <p className="status-box">{status.error}</p> : null}

      {!status.loading && investigador ? (
        <article className="detail-panel">
          <div className="breadcrumb">
            <Link to="/">Inicio</Link>
            <span>/</span>
            <Link to="/investigadores">Investigadores</Link>
            <span>/</span>
            <span>Perfil</span>
          </div>

          <h1 className="detail-title">{getDisplayName(investigador.user)}</h1>
          <div className="meta-row">
            <span className="badge">{investigador.nivel_academico || 'Investigador'}</span>
            <span className="pill">{investigador.area_investigacion || 'Área no especificada'}</span>
          </div>

          <div className="detail-cover">
            <img src={resolveBackendUrl(investigador.foto) || FALLBACK_IMAGE} alt={getDisplayName(investigador.user)} />
          </div>

          <p className="detail-text">{investigador.semblanza || 'Semblanza no disponible.'}</p>

          <section className="dashboard-section">
            <div className="section-head">
              <h2>Estudios del investigador</h2>
            </div>
            {Array.isArray(investigador.estudios) && investigador.estudios.length > 0 ? (
              <div className="dashboard-list">
                {investigador.estudios.map((estudio) => (
                  <article className="dashboard-list__item" key={estudio.id}>
                    <div>
                      <strong>{estudio.titulo}</strong>
                      <p>{estudio.categoria || 'Sin categoría'}</p>
                    </div>
                    <Link className="ghost-link" to={`/estudios/${estudio.id}`}>Ver detalle</Link>
                  </article>
                ))}
              </div>
            ) : (
              <article className="empty-state">
                <p>Este investigador aún no tiene estudios publicados.</p>
              </article>
            )}
          </section>

          <section className="dashboard-section">
            <div className="section-head">
              <h2>Noticias del investigador</h2>
            </div>
            {Array.isArray(investigador.noticias) && investigador.noticias.length > 0 ? (
              <div className="dashboard-list">
                {investigador.noticias.map((noticia) => (
                  <article className="dashboard-list__item" key={noticia.id}>
                    <div>
                      <strong>{noticia.titulo}</strong>
                      <p>{formatDate(noticia.fecha || noticia.created_at)}</p>
                    </div>
                    <Link className="ghost-link" to={`/noticias/${noticia.id}`}>Ver detalle</Link>
                  </article>
                ))}
              </div>
            ) : (
              <article className="empty-state">
                <p>Este investigador aún no tiene noticias publicadas.</p>
              </article>
            )}
          </section>
        </article>
      ) : null}
    </InstitutionLayout>
  );
}
