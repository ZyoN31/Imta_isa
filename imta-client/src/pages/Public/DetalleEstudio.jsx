import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import InstitutionLayout from '../../components/layout/InstitutionLayout';
import {
  createComentario,
  deleteComentario,
  fetchEstudio,
  formatApiError,
  getDisplayName,
  resolveBackendUrl,
  updateComentario,
} from '../../services/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469285994282-454ceb49e63a?auto=format&fit=crop&w=1400&q=80';

function formatDate(value) {
  if (!value) {
    return 'Fecha no disponible';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-MX');
}

export default function DetalleEstudio({ user, onLogout }) {
  const { id } = useParams();
  const [estudio, setEstudio] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [status, setStatus] = useState({ loading: true, error: '', success: '' });
  const [sendingComment, setSendingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContenido, setEditingContenido] = useState('');
  const [updatingComment, setUpdatingComment] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetchEstudio(id)
      .then((data) => {
        if (!mounted) {
          return;
        }

        setEstudio(data);
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
  }, [id]);

  const comentarios = useMemo(() => {
    if (!estudio?.comentarios) {
      return [];
    }

    return [...estudio.comentarios].sort((a, b) => new Date(b.fecha || b.created_at || 0) - new Date(a.fecha || a.created_at || 0));
  }, [estudio]);

  const handleSubmitComment = async (event) => {
    event.preventDefault();

    if (!nuevoComentario.trim()) {
      setStatus((previous) => ({ ...previous, error: 'El comentario no puede estar vacío.' }));
      return;
    }

    setSendingComment(true);
    setStatus((previous) => ({ ...previous, error: '', success: '' }));

    try {
      const response = await createComentario({ contenido: nuevoComentario.trim(), estudio_id: Number(id) });
      setEstudio((previous) => ({
        ...previous,
        comentarios: [response.data, ...(previous?.comentarios ?? [])],
      }));
      setNuevoComentario('');
      setStatus((previous) => ({ ...previous, success: response.message || 'Comentario publicado.' }));
    } catch (requestError) {
      setStatus((previous) => ({ ...previous, error: formatApiError(requestError), success: '' }));
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setStatus((previous) => ({ ...previous, error: '', success: '' }));

    try {
      const response = await deleteComentario(commentId);
      setEstudio((previous) => ({
        ...previous,
        comentarios: (previous?.comentarios ?? []).filter((comment) => comment.id !== commentId),
      }));
      setStatus((previous) => ({ ...previous, success: response.message || 'Comentario eliminado.' }));
    } catch (requestError) {
      setStatus((previous) => ({ ...previous, error: formatApiError(requestError), success: '' }));
    }
  };

  const canDeleteComment = (comment) => user && (comment.user_id === user.id || user.rol === 'administrador');
  const canEditComment = (comment) => user && user.rol !== 'administrador' && comment.user_id === user.id;
  const canPublishComment = user && user.rol !== 'administrador';

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContenido(comment.contenido);
    setStatus((previous) => ({ ...previous, error: '', success: '' }));
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingContenido('');
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingContenido.trim()) {
      setStatus((previous) => ({ ...previous, error: 'El comentario no puede estar vacío.', success: '' }));
      return;
    }

    setUpdatingComment(true);
    setStatus((previous) => ({ ...previous, error: '', success: '' }));

    try {
      const response = await updateComentario(commentId, { contenido: editingContenido.trim() });
      setEstudio((previous) => ({
        ...previous,
        comentarios: (previous?.comentarios ?? []).map((comment) =>
          comment.id === commentId ? { ...comment, ...response.data } : comment,
        ),
      }));
      cancelEditComment();
      setStatus((previous) => ({ ...previous, success: response.message || 'Comentario actualizado.' }));
    } catch (requestError) {
      setStatus((previous) => ({ ...previous, error: formatApiError(requestError), success: '' }));
    } finally {
      setUpdatingComment(false);
    }
  };

  return (
    <InstitutionLayout user={user} onLogout={onLogout}>
      {status.loading ? <p className="status-box">Cargando estudio...</p> : null}
      {status.error ? <p className="status-box">{status.error}</p> : null}
      {status.success ? <p className="status-box">{status.success}</p> : null}

      {!status.loading && estudio ? (
        <article className="detail-panel">
          <div className="breadcrumb">
            <Link to="/">Inicio</Link>
            <span>/</span>
            <Link to="/estudios">Estudios</Link>
            <span>/</span>
            <span>Detalle</span>
          </div>

          <h1 className="detail-title">{estudio.titulo}</h1>
          <div className="meta-row">
            <span className="badge">{estudio.categoria || 'Estudio'}</span>
            <span className="pill">{getDisplayName(estudio.investigador?.user)}</span>
          </div>

          <div className="detail-cover">
            <img src={resolveBackendUrl(estudio.foto) || FALLBACK_IMAGE} alt={estudio.titulo} />
          </div>

          <p className="detail-text">{estudio.descripcion}</p>

          {estudio.documento ? (
            <div className="meta-row">
              <a
                className="solid-link"
                href={resolveBackendUrl(estudio.documento)}
                target="_blank"
                rel="noreferrer"
              >
                Ver documento adjunto
              </a>
            </div>
          ) : null}

          <section className="comment-section">
            <h2>Comentarios ({comentarios.length})</h2>
            <div className="comment-list">
              {comentarios.map((comment) => (
                <article className="comment-card" key={comment.id}>
                  <header className="comment-card__head">
                    <strong className="comment-author">{getDisplayName(comment.user)}</strong>
                    <div className="comment-meta">
                      <span className="comment-date">{formatDate(comment.fecha || comment.created_at)}</span>
                      {canEditComment(comment) ? (
                        <button type="button" className="ghost-button" onClick={() => startEditComment(comment)}>
                          Editar
                        </button>
                      ) : null}
                      {canDeleteComment(comment) ? (
                        <button type="button" className="danger-button" onClick={() => handleDeleteComment(comment.id)}>
                          Eliminar
                        </button>
                      ) : null}
                    </div>
                  </header>
                  {editingCommentId === comment.id ? (
                    <div className="form-grid">
                      <textarea
                        className="form-textarea"
                        value={editingContenido}
                        onChange={(event) => setEditingContenido(event.target.value)}
                      />
                      <div className="form-actions">
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={updatingComment}
                        >
                          {updatingComment ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button type="button" className="ghost-button" onClick={cancelEditComment} disabled={updatingComment}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>{comment.contenido}</p>
                  )}
                </article>
              ))}
            </div>

            {canPublishComment ? (
              <form className="comment-form form-grid" onSubmit={handleSubmitComment}>
                <label htmlFor="estudio-comment">Agregar comentario</label>
                <textarea
                  id="estudio-comment"
                  className="form-textarea"
                  placeholder="Comparte una observación técnica..."
                  value={nuevoComentario}
                  onChange={(event) => setNuevoComentario(event.target.value)}
                />
                <div className="form-actions">
                  <button type="submit" className="primary-button" disabled={sendingComment}>
                    {sendingComment ? 'Publicando...' : 'Publicar comentario'}
                  </button>
                </div>
              </form>
            ) : user ? (
              <article className="empty-state">
                <p>Tu cuenta de administrador solo puede moderar comentarios.</p>
              </article>
            ) : (
              <article className="empty-state">
                <p>
                  Para comentar, inicia sesión desde <Link to="/login">este enlace</Link>.
                </p>
              </article>
            )}
          </section>
        </article>
      ) : null}
    </InstitutionLayout>
  );
}
