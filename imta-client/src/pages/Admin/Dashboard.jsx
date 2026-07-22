import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import InstitutionLayout from '../../components/layout/InstitutionLayout';
import {
  createInvestigador,
  deleteComentario,
  deleteConsultor,
  deleteEstudio,
  deleteInvestigador,
  deleteNoticia,
  fetchAdminComentarios,
  fetchAdminConsultores,
  fetchEstudios,
  fetchInvestigadores,
  fetchNoticias,
  formatApiError,
  getDisplayName,
  resolveBackendUrl,
  updateInvestigador,
} from '../../services/api';

const ADMIN_SECTIONS = [
  { id: 'investigadores', label: 'Investigadores' },
  { id: 'consultores', label: 'Consultores' },
  { id: 'estudios', label: 'Estudios' },
  { id: 'noticias', label: 'Noticias' },
  { id: 'comentarios', label: 'Comentarios' },
];

function normalize(value) {
  return String(value ?? '').toLowerCase().trim();
}

function formatDate(value) {
  if (!value) {
    return 'Fecha no disponible';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-MX');
}

function toDateValue(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function matchesDateRange(value, from, to) {
  const dateValue = toDateValue(value);
  if (!dateValue) {
    return false;
  }

  if (from && dateValue < from) {
    return false;
  }

  if (to && dateValue > to) {
    return false;
  }

  return true;
}

function downloadPdfReport({ filename, title, headers, rows }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });

  doc.setFillColor(97, 18, 50);
  doc.rect(40, 36, 515, 8, 'F');

  doc.setTextColor(58, 11, 30);
  doc.setFontSize(20);
  doc.text(title, 40, 72);

  doc.setTextColor(70, 70, 70);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 40, 92);

  const safeRows = rows.length > 0 ? rows : [Array(headers.length).fill('Sin resultados con los filtros aplicados')];

  autoTable(doc, {
    startY: 110,
    head: [headers],
    body: safeRows,
    theme: 'grid',
    margin: { left: 40, right: 40 },
    styles: {
      fontSize: 10,
      cellPadding: 7,
      lineColor: [24, 24, 24],
      lineWidth: 0.8,
      textColor: [30, 30, 30],
      valign: 'middle',
    },
    headStyles: {
      fillColor: [97, 18, 50],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11,
    },
    bodyStyles: {
      fillColor: [243, 243, 243],
    },
    alternateRowStyles: {
      fillColor: [234, 234, 234],
    },
  });

  doc.save(filename);
}

export default function Dashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('investigadores');
  const [investigadores, setInvestigadores] = useState([]);
  const [consultores, setConsultores] = useState([]);
  const [estudios, setEstudios] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '', success: '' });
  const [newInvestigador, setNewInvestigador] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    password: '',
    password_confirmation: '',
    nivel_academico: '',
    area_investigacion: '',
    semblanza: '',
    foto: null,
  });
  const [editingInvestigadorId, setEditingInvestigadorId] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    investigadores: { search: '', nivel: '', area: '' },
    consultores: { search: '', email: '' },
    estudios: { search: '', autor: '', categoria: '', from: '', to: '' },
    noticias: { search: '', autor: '', from: '', to: '' },
    comentarios: { search: '', usuario: '', tipo: '', from: '', to: '' },
  });

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchInvestigadores(),
      fetchAdminConsultores(),
      fetchEstudios(),
      fetchNoticias(),
      fetchAdminComentarios(),
    ])
      .then(([investigadoresData, consultoresData, estudiosData, noticiasData, comentariosData]) => {
        if (!mounted) {
          return;
        }

        setInvestigadores(Array.isArray(investigadoresData) ? investigadoresData : []);
        setConsultores(Array.isArray(consultoresData) ? consultoresData : []);
        setEstudios(Array.isArray(estudiosData) ? estudiosData : []);
        setNoticias(Array.isArray(noticiasData) ? noticiasData : []);
        setComentarios(Array.isArray(comentariosData) ? comentariosData : []);
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

  const filteredInvestigadores = useMemo(() => {
    const filter = filters.investigadores;
    const query = normalize(filter.search);

    return investigadores.filter((item) => {
      const fullName = normalize(getDisplayName(item.user));
      const nivel = normalize(item.nivel_academico);
      const area = normalize(item.area_investigacion);

      const matchesSearch = !query || [fullName, nivel, area].some((value) => value.includes(query));
      const matchesNivel = !normalize(filter.nivel) || nivel.includes(normalize(filter.nivel));
      const matchesArea = !normalize(filter.area) || area.includes(normalize(filter.area));

      return matchesSearch && matchesNivel && matchesArea;
    });
  }, [filters.investigadores, investigadores]);

  const filteredConsultores = useMemo(() => {
    const filter = filters.consultores;
    const search = normalize(filter.search);
    const emailFilter = normalize(filter.email);

    return consultores.filter((item) => {
      const name = normalize(getDisplayName(item));
      const email = normalize(item.email);
      const matchesSearch = !search || name.includes(search) || email.includes(search);
      const matchesEmail = !emailFilter || email.includes(emailFilter);
      return matchesSearch && matchesEmail;
    });
  }, [consultores, filters.consultores]);

  const filteredEstudios = useMemo(() => {
    const filter = filters.estudios;
    const query = normalize(filter.search);
    const autor = normalize(filter.autor);
    const categoria = normalize(filter.categoria);

    return estudios.filter((item) => {
      const title = normalize(item.titulo);
      const author = normalize(getDisplayName(item.investigador?.user));
      const category = normalize(item.categoria);
      const dateValue = item.created_at || item.updated_at;

      const matchesSearch = !query || [title, author, category].some((value) => value.includes(query));
      const matchesAutor = !autor || author.includes(autor);
      const matchesCategoria = !categoria || category.includes(categoria);
      const matchesDate = (!filter.from && !filter.to) || matchesDateRange(dateValue, filter.from, filter.to);

      return matchesSearch && matchesAutor && matchesCategoria && matchesDate;
    });
  }, [estudios, filters.estudios]);

  const filteredNoticias = useMemo(() => {
    const filter = filters.noticias;
    const query = normalize(filter.search);
    const autor = normalize(filter.autor);

    return noticias.filter((item) => {
      const title = normalize(item.titulo);
      const author = normalize(getDisplayName(item.investigador?.user));
      const dateValue = item.fecha || item.created_at;

      const matchesSearch = !query || [title, author].some((value) => value.includes(query));
      const matchesAutor = !autor || author.includes(autor);
      const matchesDate = (!filter.from && !filter.to) || matchesDateRange(dateValue, filter.from, filter.to);

      return matchesSearch && matchesAutor && matchesDate;
    });
  }, [noticias, filters.noticias]);

  const filteredComentarios = useMemo(() => {
    const filter = filters.comentarios;
    const query = normalize(filter.search);
    const usuario = normalize(filter.usuario);
    const tipo = normalize(filter.tipo);

    return comentarios.filter((item) => {
      const content = normalize(item.contenido);
      const userName = normalize(getDisplayName(item.user));
      const sourceType = item.estudio_id ? 'estudio' : 'noticia';
      const sourceTitle = normalize(item.estudio?.titulo || item.noticia?.titulo);
      const dateValue = item.fecha || item.created_at;

      const matchesSearch = !query || [content, userName, sourceTitle].some((value) => value.includes(query));
      const matchesUsuario = !usuario || userName.includes(usuario);
      const matchesTipo = !tipo || sourceType.includes(tipo);
      const matchesDate = (!filter.from && !filter.to) || matchesDateRange(dateValue, filter.from, filter.to);

      return matchesSearch && matchesUsuario && matchesTipo && matchesDate;
    });
  }, [comentarios, filters.comentarios]);

  const setSectionFilter = (section, patch) => {
    setFilters((previous) => ({
      ...previous,
      [section]: { ...previous[section], ...patch },
    }));
  };

  const resetInvestigadorForm = () => {
    setNewInvestigador({
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      email: '',
      password: '',
      password_confirmation: '',
      nivel_academico: '',
      area_investigacion: '',
      semblanza: '',
      foto: null,
    });
    setEditingInvestigadorId(null);
    setChangingPassword(false);
  };

  const handleEditInvestigador = (item) => {
    setActiveSection('investigadores');
    setEditingInvestigadorId(item.id);
    setNewInvestigador({
      nombre: item.user?.nombre || '',
      apellido_paterno: item.user?.apellido_paterno || '',
      apellido_materno: item.user?.apellido_materno || '',
      email: item.user?.email || '',
      password: '',
      password_confirmation: '',
      nivel_academico: item.nivel_academico || '',
      area_investigacion: item.area_investigacion || '',
      semblanza: item.semblanza || '',
      foto: null,
    });
    setChangingPassword(false);
  };

  const handleCreateInvestigador = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus((previous) => ({ ...previous, error: '', success: '' }));

    try {
      const payload = { ...newInvestigador };
      const mustSendPassword = !editingInvestigadorId || changingPassword;
      if (mustSendPassword && payload.password !== payload.password_confirmation) {
        setStatus((previous) => ({
          ...previous,
          success: '',
          error: 'La confirmación de contraseña no coincide.',
        }));
        setSubmitting(false);
        return;
      }

      if (!mustSendPassword || !payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }

      if (editingInvestigadorId) {
        const response = await updateInvestigador(editingInvestigadorId, payload);
        const refreshed = await fetchInvestigadores();
        setInvestigadores(Array.isArray(refreshed) ? refreshed : []);
        setStatus((previous) => ({
          ...previous,
          success: response.message || 'Investigador actualizado correctamente.',
        }));
      } else {
        const response = await createInvestigador(payload);
        const created = response.data;
        setInvestigadores((previous) => [created, ...previous]);
        setStatus((previous) => ({
          ...previous,
          success: response.message || 'Investigador registrado correctamente.',
        }));
      }

      resetInvestigadorForm();
      setStatus((previous) => ({
        ...previous,
        error: '',
      }));
    } catch (requestError) {
      setStatus((previous) => ({ ...previous, error: formatApiError(requestError), success: '' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async ({ type, id }) => {
    setStatus((previous) => ({ ...previous, error: '', success: '' }));

    try {
      if (type === 'investigador') {
        const response = await deleteInvestigador(id);
        setInvestigadores((previous) => previous.filter((item) => item.id !== id));
        setStatus((previous) => ({ ...previous, success: response.message || 'Investigador eliminado.' }));
      }

      if (type === 'estudio') {
        const response = await deleteEstudio(id);
        setEstudios((previous) => previous.filter((item) => item.id !== id));
        setStatus((previous) => ({ ...previous, success: response.message || 'Estudio eliminado.' }));
      }

      if (type === 'noticia') {
        const response = await deleteNoticia(id);
        setNoticias((previous) => previous.filter((item) => item.id !== id));
        setStatus((previous) => ({ ...previous, success: response.message || 'Noticia eliminada.' }));
      }

      if (type === 'comentario') {
        const response = await deleteComentario(id);
        setComentarios((previous) => previous.filter((item) => item.id !== id));
        setStatus((previous) => ({ ...previous, success: response.message || 'Comentario eliminado.' }));
      }

      if (type === 'consultor') {
        const response = await deleteConsultor(id);
        setConsultores((previous) => previous.filter((item) => item.id !== id));
        setStatus((previous) => ({ ...previous, success: response.message || 'Consultor eliminado.' }));
      }
    } catch (requestError) {
      setStatus((previous) => ({ ...previous, error: formatApiError(requestError), success: '' }));
    }
  };

  const exportSectionReport = (sectionId) => {
    if (sectionId === 'investigadores') {
      downloadPdfReport({
        filename: 'reporte-investigadores.pdf',
        title: 'Reporte de investigadores',
        headers: ['ID', 'Nombre completo', 'Correo', 'Nivel académico', 'Área de investigación'],
        rows: filteredInvestigadores.map((item, index) => [
          String(index + 1).padStart(4, '0'),
          getDisplayName(item.user),
          item.user?.email || '',
          item.nivel_academico || '',
          item.area_investigacion || '',
        ]),
      });
    }

    if (sectionId === 'consultores') {
      downloadPdfReport({
        filename: 'reporte-consultores.pdf',
        title: 'Reporte de consultores',
        headers: ['ID', 'Nombre completo', 'Correo institucional', 'Fecha de alta'],
        rows: filteredConsultores.map((item, index) => [
          String(index + 1).padStart(4, '0'),
          getDisplayName(item),
          item.email || '',
          formatDate(item.created_at),
        ]),
      });
    }

    if (sectionId === 'estudios') {
      downloadPdfReport({
        filename: 'reporte-estudios.pdf',
        title: 'Reporte de estudios',
        headers: ['ID', 'Título', 'Autor', 'Categoría', 'Fecha de publicación', 'Documento'],
        rows: filteredEstudios.map((item, index) => [
          `E${String(index + 1).padStart(3, '0')}`,
          item.titulo || '',
          getDisplayName(item.investigador?.user),
          item.categoria || '',
          formatDate(item.created_at || item.updated_at),
          resolveBackendUrl(item.documento) || '',
        ]),
      });
    }

    if (sectionId === 'noticias') {
      downloadPdfReport({
        filename: 'reporte-noticias.pdf',
        title: 'Reporte de noticias',
        headers: ['ID', 'Título', 'Autor', 'Fecha de publicación'],
        rows: filteredNoticias.map((item, index) => [
          `N${String(index + 1).padStart(3, '0')}`,
          item.titulo || '',
          getDisplayName(item.investigador?.user),
          formatDate(item.fecha || item.created_at),
        ]),
      });
    }

    if (sectionId === 'comentarios') {
      downloadPdfReport({
        filename: 'reporte-comentarios.pdf',
        title: 'Reporte de comentarios',
        headers: ['ID', 'Contenido', 'Usuario', 'Publicación', 'Fecha de publicación'],
        rows: filteredComentarios.map((item, index) => [
          `C${String(index + 1).padStart(3, '0')}`,
          item.contenido || '',
          getDisplayName(item.user),
          item.estudio?.titulo || item.noticia?.titulo || '',
          formatDate(item.fecha || item.created_at),
        ]),
      });
    }
  };

  const renderInvestigadores = () => (
    <div className="admin-section">
      <div className="section-head">
        <div>
          <h2>Gestión de investigadores</h2>
          <p>Filtra perfiles por nombre, grado académico y área.</p>
        </div>
        <button type="button" className="solid-link" onClick={() => exportSectionReport('investigadores')}>
          Descargar PDF
        </button>
      </div>

      <div className="form-grid form-grid--two">
        <input
          className="search-input"
          placeholder="Buscar investigador"
          value={filters.investigadores.search}
          onChange={(event) => setSectionFilter('investigadores', { search: event.target.value })}
        />
        <input
          className="search-input"
          placeholder="Filtrar por grado académico"
          value={filters.investigadores.nivel}
          onChange={(event) => setSectionFilter('investigadores', { nivel: event.target.value })}
        />
      </div>

      <input
        className="search-input"
        placeholder="Filtrar por área"
        value={filters.investigadores.area}
        onChange={(event) => setSectionFilter('investigadores', { area: event.target.value })}
      />
      <p className="muted-text">Filtros opcionales para refinar el PDF: nombre, grado académico y área.</p>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Nivel</th>
              <th>Área</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvestigadores.map((item) => (
              <tr key={item.id}>
                <td>{getDisplayName(item.user)}</td>
                <td>{item.user?.email || 'Sin correo'}</td>
                <td>{item.nivel_academico || 'Sin dato'}</td>
                <td>{item.area_investigacion || 'Sin dato'}</td>
                <td>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => handleEditInvestigador(item)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDelete({ type: 'investigador', id: item.id })}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderConsultores = () => (
    <div className="admin-section">
      <div className="section-head">
        <div>
          <h2>Gestión de consultores</h2>
          <p>Consulta y filtra cuentas registradas de usuarios externos.</p>
        </div>
        <button type="button" className="solid-link" onClick={() => exportSectionReport('consultores')}>
          Descargar PDF
        </button>
      </div>

      <div className="form-grid form-grid--two">
        <input
          className="search-input"
          placeholder="Buscar consultor"
          value={filters.consultores.search}
          onChange={(event) => setSectionFilter('consultores', { search: event.target.value })}
        />
        <input
          className="search-input"
          placeholder="Filtrar por correo"
          value={filters.consultores.email}
          onChange={(event) => setSectionFilter('consultores', { email: event.target.value })}
        />
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Fecha de alta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredConsultores.map((item) => (
              <tr key={item.id}>
                <td>{getDisplayName(item)}</td>
                <td>{item.email}</td>
                <td>{formatDate(item.created_at)}</td>
                <td>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDelete({ type: 'consultor', id: item.id })}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEstudios = () => (
    <div className="admin-section">
      <div className="section-head">
        <div>
          <h2>Gestión de estudios</h2>
          <p>Filtra publicaciones y elimina estudios cuando sea necesario.</p>
        </div>
        <button type="button" className="solid-link" onClick={() => exportSectionReport('estudios')}>
          Descargar PDF
        </button>
      </div>

      <div className="form-grid form-grid--two">
        <input
          className="search-input"
          placeholder="Buscar estudio"
          value={filters.estudios.search}
          onChange={(event) => setSectionFilter('estudios', { search: event.target.value })}
        />
        <input
          className="search-input"
          placeholder="Filtrar por autor"
          value={filters.estudios.autor}
          onChange={(event) => setSectionFilter('estudios', { autor: event.target.value })}
        />
      </div>

      <div className="form-grid form-grid--two">
        <input
          className="search-input"
          placeholder="Filtrar por categoría"
          value={filters.estudios.categoria}
          onChange={(event) => setSectionFilter('estudios', { categoria: event.target.value })}
        />
        <div className="form-grid form-grid--two">
          <input
            className="form-input"
            type="date"
            value={filters.estudios.from}
            onChange={(event) => setSectionFilter('estudios', { from: event.target.value })}
          />
          <input
            className="form-input"
            type="date"
            value={filters.estudios.to}
            onChange={(event) => setSectionFilter('estudios', { to: event.target.value })}
          />
        </div>
      </div>
      <p className="muted-text">Filtros opcionales para refinar el PDF: autor, clasificación y fecha de publicación.</p>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Categoría</th>
              <th>Fecha</th>
              <th>Documento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEstudios.map((item) => (
              <tr key={item.id}>
                <td>{item.titulo}</td>
                <td>{getDisplayName(item.investigador?.user)}</td>
                <td>{item.categoria || 'Sin categoría'}</td>
                <td>{formatDate(item.created_at || item.updated_at)}</td>
                <td>
                  {item.documento ? (
                    <a href={resolveBackendUrl(item.documento)} target="_blank" rel="noreferrer">
                      Descargar
                    </a>
                  ) : 'Sin documento'}
                </td>
                <td>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDelete({ type: 'estudio', id: item.id })}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNoticias = () => (
    <div className="admin-section">
      <div className="section-head">
        <div>
          <h2>Gestión de noticias</h2>
          <p>Filtra por autor y fecha de publicación, además de eliminar registros.</p>
        </div>
        <button type="button" className="solid-link" onClick={() => exportSectionReport('noticias')}>
          Descargar PDF
        </button>
      </div>

      <div className="form-grid form-grid--two">
        <input
          className="search-input"
          placeholder="Buscar noticia"
          value={filters.noticias.search}
          onChange={(event) => setSectionFilter('noticias', { search: event.target.value })}
        />
        <input
          className="search-input"
          placeholder="Filtrar por autor"
          value={filters.noticias.autor}
          onChange={(event) => setSectionFilter('noticias', { autor: event.target.value })}
        />
      </div>

      <div className="form-grid form-grid--two">
        <input
          className="form-input"
          type="date"
          value={filters.noticias.from}
          onChange={(event) => setSectionFilter('noticias', { from: event.target.value })}
        />
        <input
          className="form-input"
          type="date"
          value={filters.noticias.to}
          onChange={(event) => setSectionFilter('noticias', { to: event.target.value })}
        />
      </div>
      <p className="muted-text">Filtros opcionales para refinar el PDF: autor y fecha de publicación.</p>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Fecha publicación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredNoticias.map((item) => (
              <tr key={item.id}>
                <td>{item.titulo}</td>
                <td>{getDisplayName(item.investigador?.user)}</td>
                <td>{formatDate(item.fecha || item.created_at)}</td>
                <td>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDelete({ type: 'noticia', id: item.id })}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderComentarios = () => (
    <div className="admin-section">
      <div className="section-head">
        <div>
          <h2>Gestión de comentarios</h2>
          <p>Filtra por usuario, tipo y fecha; elimina comentarios cuando sea necesario.</p>
        </div>
        <button type="button" className="solid-link" onClick={() => exportSectionReport('comentarios')}>
          Descargar PDF
        </button>
      </div>

      <div className="form-grid form-grid--two">
        <input
          className="search-input"
          placeholder="Buscar comentario"
          value={filters.comentarios.search}
          onChange={(event) => setSectionFilter('comentarios', { search: event.target.value })}
        />
        <input
          className="search-input"
          placeholder="Filtrar por usuario"
          value={filters.comentarios.usuario}
          onChange={(event) => setSectionFilter('comentarios', { usuario: event.target.value })}
        />
      </div>

      <div className="form-grid form-grid--two">
        <select
          className="form-select"
          value={filters.comentarios.tipo}
          onChange={(event) => setSectionFilter('comentarios', { tipo: event.target.value })}
        >
          <option value="">Todos</option>
          <option value="estudio">Estudios</option>
          <option value="noticia">Noticias</option>
        </select>
        <div className="form-grid form-grid--two">
          <input
            className="form-input"
            type="date"
            value={filters.comentarios.from}
            onChange={(event) => setSectionFilter('comentarios', { from: event.target.value })}
          />
          <input
            className="form-input"
            type="date"
            value={filters.comentarios.to}
            onChange={(event) => setSectionFilter('comentarios', { to: event.target.value })}
          />
        </div>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Contenido</th>
              <th>Tipo</th>
              <th>Publicación</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredComentarios.map((item) => (
              <tr key={item.id}>
                <td>{getDisplayName(item.user)}</td>
                <td>{item.contenido}</td>
                <td>{item.estudio_id ? 'Estudio' : 'Noticia'}</td>
                <td>{item.estudio?.titulo || item.noticia?.titulo || 'Sin publicación'}</td>
                <td>{formatDate(item.fecha || item.created_at)}</td>
                <td>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDelete({ type: 'comentario', id: item.id })}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <InstitutionLayout user={user} onLogout={onLogout}>
      <section className="section-head">
        <div>
          <h2>Panel administrativo</h2>
          <p>Gestión integral de publicaciones, usuarios y comentarios con filtros y reportes.</p>
        </div>
      </section>

      {status.loading ? <p className="status-box">Cargando panel administrativo...</p> : null}
      {status.error ? <p className="status-box">{status.error}</p> : null}
      {status.success ? <p className="status-box">{status.success}</p> : null}

      <section className="dashboard-grid">
        <article className="stat-card">
          <strong>{investigadores.length}</strong>
          <span>Investigadores registrados</span>
        </article>
        <article className="stat-card">
          <strong>{consultores.length}</strong>
          <span>Consultores registrados</span>
        </article>
        <article className="stat-card">
          <strong>{estudios.length + noticias.length}</strong>
          <span>Publicaciones totales</span>
        </article>
      </section>

      <section className="dashboard-section panel management-panel">
        <div className="section-head">
          <div>
            <h2>{editingInvestigadorId ? 'Edición de investigador' : 'Alta de investigador con cuenta'}</h2>
            <p>
              {editingInvestigadorId
                ? 'Actualiza el perfil del investigador y su cuenta de acceso.'
                : 'Crea el perfil del investigador y su cuenta de acceso desde administración.'}
            </p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleCreateInvestigador}>
          <div className="form-grid form-grid--two">
            <input
              id="admin-nombre"
              className="form-input"
              placeholder="Nombre"
              value={newInvestigador.nombre}
              onChange={(event) => setNewInvestigador((previous) => ({ ...previous, nombre: event.target.value }))}
              required
            />
            <input
              id="admin-apellido-paterno"
              className="form-input"
              placeholder="Apellido paterno"
              value={newInvestigador.apellido_paterno}
              onChange={(event) => setNewInvestigador((previous) => ({ ...previous, apellido_paterno: event.target.value }))}
              required
            />
          </div>

          <div className="form-grid form-grid--two">
            <input
              id="admin-apellido-materno"
              className="form-input"
              placeholder="Apellido materno (opcional)"
              value={newInvestigador.apellido_materno}
              onChange={(event) => setNewInvestigador((previous) => ({ ...previous, apellido_materno: event.target.value }))}
            />
            <input
              id="admin-email"
              type="email"
              className="form-input"
              placeholder="Correo institucional"
              value={newInvestigador.email}
              onChange={(event) => setNewInvestigador((previous) => ({ ...previous, email: event.target.value }))}
              required
            />
          </div>

          {!editingInvestigadorId || changingPassword ? (
            <div className="form-grid form-grid--two">
              <input
                id="admin-password"
                type="password"
                className="form-input"
                placeholder={editingInvestigadorId ? 'Nueva contraseña (mínimo 8 caracteres)' : 'Contraseña inicial'}
                value={newInvestigador.password}
                autoComplete="new-password"
                onChange={(event) => setNewInvestigador((previous) => ({ ...previous, password: event.target.value }))}
                required={!editingInvestigadorId || changingPassword}
                minLength={8}
              />
              <input
                id="admin-password-confirmation"
                type="password"
                className="form-input"
                placeholder="Confirmar contraseña"
                value={newInvestigador.password_confirmation}
                autoComplete="new-password"
                onChange={(event) => setNewInvestigador((previous) => ({ ...previous, password_confirmation: event.target.value }))}
                required={!editingInvestigadorId || changingPassword}
                minLength={8}
              />
            </div>
          ) : (
            <div className="form-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setChangingPassword(true);
                  setNewInvestigador((previous) => ({ ...previous, password: '', password_confirmation: '' }));
                }}
              >
                Cambiar contraseña
              </button>
            </div>
          )}

          {editingInvestigadorId && changingPassword ? (
            <div className="form-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setChangingPassword(false);
                  setNewInvestigador((previous) => ({ ...previous, password: '', password_confirmation: '' }));
                }}
              >
                Cancelar cambio de contraseña
              </button>
            </div>
          ) : null}

          <div className="form-grid form-grid--two">
            <input
              id="admin-nivel-academico"
              className="form-input"
              placeholder="Nivel académico"
              value={newInvestigador.nivel_academico}
              onChange={(event) => setNewInvestigador((previous) => ({ ...previous, nivel_academico: event.target.value }))}
              required
            />
            <input
              id="admin-area-investigacion"
              className="form-input"
              placeholder="Área de investigación"
              value={newInvestigador.area_investigacion}
              onChange={(event) => setNewInvestigador((previous) => ({ ...previous, area_investigacion: event.target.value }))}
              required
            />
          </div>

          <textarea
            id="admin-semblanza"
            className="form-textarea"
            placeholder="Semblanza"
            value={newInvestigador.semblanza}
            onChange={(event) => setNewInvestigador((previous) => ({ ...previous, semblanza: event.target.value }))}
            required
          />

          <input
            id="admin-foto"
            type="file"
            className="form-input"
            accept="image/png,image/jpeg,image/jpg"
            onChange={(event) => setNewInvestigador((previous) => ({ ...previous, foto: event.target.files?.[0] ?? null }))}
          />

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Guardando...' : editingInvestigadorId ? 'Actualizar investigador' : 'Registrar investigador'}
            </button>
            {editingInvestigadorId ? (
              <button type="button" className="ghost-button" onClick={resetInvestigadorForm} disabled={submitting}>
                Cancelar edición
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="dashboard-section panel management-panel">
        <div className="admin-tabs">
          {ADMIN_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`admin-tab${activeSection === section.id ? ' is-active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>

        {activeSection === 'investigadores' ? renderInvestigadores() : null}
        {activeSection === 'consultores' ? renderConsultores() : null}
        {activeSection === 'estudios' ? renderEstudios() : null}
        {activeSection === 'noticias' ? renderNoticias() : null}
        {activeSection === 'comentarios' ? renderComentarios() : null}
      </section>
    </InstitutionLayout>
  );
}
