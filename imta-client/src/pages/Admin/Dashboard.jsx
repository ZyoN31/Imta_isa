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

const REPORT_SECTIONS = [
  { id: 'investigadores', label: 'Investigadores' },
  { id: 'estudios', label: 'Estudios' },
  { id: 'noticias', label: 'Noticias' },
  { id: 'publicaciones', label: 'Proyectos / Publicaciones' },
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

function percent(part, total) {
  if (!total) {
    return '0%';
  }

  return `${((part / total) * 100).toFixed(1)}%`;
}

function matchesMonthYear(value, month, year) {
  if (!value || (!month && !year)) {
    return true;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  if (month && date.getMonth() + 1 !== Number(month)) {
    return false;
  }

  if (year && date.getFullYear() !== Number(year)) {
    return false;
  }

  return true;
}

function downloadPdfReport({ filename, title, subtitle, summary = [], tables = [], headers, rows }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });

  doc.setFillColor(97, 18, 50);
  doc.rect(40, 36, 515, 8, 'F');

  doc.setTextColor(58, 11, 30);
  doc.setFontSize(20);
  doc.text(title, 40, 72);

  if (subtitle) {
   doc.setFontSize(11);
   doc.setTextColor(90, 90, 90);
   doc.text(subtitle, 40, 88);
  }

  doc.setTextColor(70, 70, 70);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 40, subtitle ? 104 : 92);

  const reportTables = tables.length > 0 ? tables : (headers ? [{ headers, rows }] : []);
  let currentY = subtitle ? 120 : 110;

  if (summary.length > 0) {
   autoTable(doc, {
     startY: currentY,
     head: [['Métrica', 'Valor']],
     body: summary,
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

   currentY = doc.lastAutoTable.finalY + 16;
  }

  reportTables.forEach((table, index) => {
   const safeRows = table.rows.length > 0 ? table.rows : [Array(table.headers.length).fill('Sin resultados con los filtros aplicados')];

   if (table.label) {
     doc.setTextColor(58, 11, 30);
     doc.setFontSize(12);
     doc.text(table.label, 40, currentY);
     currentY += 10;
   }

   autoTable(doc, {
     startY: currentY,
     head: [table.headers],
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

   currentY = doc.lastAutoTable.finalY + (index < reportTables.length - 1 ? 16 : 0);
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
  const [reportStatus, setReportStatus] = useState({ error: '', success: '' });
  const [activeReportTab, setActiveReportTab] = useState('investigadores');
  const [reportFilters, setReportFilters] = useState({
    investigadores: { search: '', nivel: '', area: '', from: '', to: '' },
    estudios: { autor: '', categoria: '', from: '', to: '' },
    noticias: { autor: '', from: '', to: '' },
    publicaciones: { investigadorId: '', from: '', to: '' },
  });
  const [filters, setFilters] = useState({
    investigadores: { search: '', nivel: '', area: '' },
    consultores: { search: '', email: '', mes: '', anio: '' },
    estudios: { search: '', autor: '', categoria: '', mes: '', anio: '' },
    noticias: { search: '', autor: '', mes: '', anio: '' },
    comentarios: { search: '', usuario: '', tipo: '', publicacion: '', mes: '', anio: '' },
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
      const createdAt = item.created_at || item.updated_at;
      const matchesSearch = !search || name.includes(search) || email.includes(search);
      const matchesEmail = !emailFilter || email.includes(emailFilter);
      const matchesDate = matchesMonthYear(createdAt, filter.mes, filter.anio);
      return matchesSearch && matchesEmail && matchesDate;
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
      const matchesDate = matchesMonthYear(dateValue, filter.mes, filter.anio);

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
      const matchesDate = matchesMonthYear(dateValue, filter.mes, filter.anio);

      return matchesSearch && matchesAutor && matchesDate;
    });
  }, [noticias, filters.noticias]);

  const filteredComentarios = useMemo(() => {
    const filter = filters.comentarios;
    const query = normalize(filter.search);
    const usuario = normalize(filter.usuario);
    const tipo = normalize(filter.tipo);
    const publicacion = normalize(filter.publicacion);

    return comentarios.filter((item) => {
      const content = normalize(item.contenido);
      const userName = normalize(getDisplayName(item.user));
      const sourceType = item.estudio_id ? 'estudio' : 'noticia';
      const sourceTitle = normalize(item.estudio?.titulo || item.noticia?.titulo);
      const dateValue = item.fecha || item.created_at;

      const matchesSearch = !query || [content, userName, sourceTitle].some((value) => value.includes(query));
      const matchesUsuario = !usuario || userName.includes(usuario);
      const matchesTipo = !tipo || sourceType.includes(tipo);
      const matchesPublicacion = !publicacion || sourceTitle.includes(publicacion);
      const matchesDate = matchesMonthYear(dateValue, filter.mes, filter.anio);

      return matchesSearch && matchesUsuario && matchesTipo && matchesPublicacion && matchesDate;
    });
  }, [comentarios, filters.comentarios]);

  const reportInvestigatorOptions = useMemo(
    () =>
      investigadores.map((item) => ({
        id: item.id,
        label: getDisplayName(item.user),
      })),
    [investigadores],
  );

  const setSectionFilter = (section, patch) => {
    setFilters((previous) => ({
      ...previous,
      [section]: { ...previous[section], ...patch },
    }));
  };

  const setReportFilter = (section, patch) => {
    setReportFilters((previous) => ({
      ...previous,
      [section]: { ...previous[section], ...patch },
    }));
  };

  const getFilteredInvestigadoresForReport = () => {
    const filter = reportFilters.investigadores;
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
  };

  const getFilteredStudyRecordsForReport = () => {
    const filter = reportFilters.estudios;
    const query = normalize(filter.autor);
    const category = normalize(filter.categoria);

    return estudios.filter((item) => {
      const author = normalize(getDisplayName(item.investigador?.user));
      const categoryValue = normalize(item.categoria);
      const dateValue = item.created_at || item.updated_at;

      const matchesAutor = !query || author.includes(query);
      const matchesCategoria = !category || categoryValue.includes(category);
      const matchesDate = (!filter.from && !filter.to) || matchesDateRange(dateValue, filter.from, filter.to);

      return matchesAutor && matchesCategoria && matchesDate;
    });
  };

  const getFilteredNewsRecordsForReport = () => {
    const filter = reportFilters.noticias;
    const query = normalize(filter.autor);

    return noticias.filter((item) => {
      const author = normalize(getDisplayName(item.investigador?.user));
      const dateValue = item.fecha || item.created_at;
      const matchesAutor = !query || author.includes(query);
      const matchesDate = (!filter.from && !filter.to) || matchesDateRange(dateValue, filter.from, filter.to);
      return matchesAutor && matchesDate;
    });
  };

  const getFilteredPublicationRecordsForReport = () => {
    const filter = reportFilters.publicaciones;
    const investigatorId = filter.investigadorId;
    const studies = estudios.filter((item) => {
      const matchesResearcher = !investigatorId || Number(item.investigador_id) === Number(investigatorId);
      const matchesDate = (!filter.from && !filter.to) || matchesDateRange(item.created_at || item.updated_at, filter.from, filter.to);
      return matchesResearcher && matchesDate;
    });
    const news = noticias.filter((item) => {
      const matchesResearcher = !investigatorId || Number(item.investigador_id) === Number(investigatorId);
      const matchesDate = (!filter.from && !filter.to) || matchesDateRange(item.fecha || item.created_at, filter.from, filter.to);
      return matchesResearcher && matchesDate;
    });
    return { studies, news };
  };

  const getMonthsInRange = (from, to) => {
    if (!from || !to) {
      return 1;
    }

    const start = new Date(from);
    const end = new Date(to);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return 1;
    }

    return Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1);
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

  const renderReportMetricCards = (metrics) => (
    <section className="cards-grid">
      {metrics.map((metric) => (
        <article className="panel-card" key={metric.label}>
          <strong>{metric.value}</strong>
          <span>{metric.label}</span>
        </article>
      ))}
    </section>
  );

  const buildAdminReport = () => {
    setReportStatus({ error: '', success: '' });

    if (activeReportTab === 'investigadores') {
      const filter = reportFilters.investigadores;
      const selectedInvestigadores = getFilteredInvestigadoresForReport();
      const publications = selectedInvestigadores.map((item) => {
        const studiesCount = estudios.filter(
          (study) => Number(study.investigador_id) === Number(item.id) && matchesDateRange(study.created_at || study.updated_at, filter.from, filter.to),
        ).length;
        const newsCount = noticias.filter(
          (newsItem) => Number(newsItem.investigador_id) === Number(item.id) && matchesDateRange(newsItem.fecha || newsItem.created_at, filter.from, filter.to),
        ).length;
        return {
          name: getDisplayName(item.user),
          studiesCount,
          newsCount,
          total: studiesCount + newsCount,
          area: item.area_investigacion || 'Sin área',
          nivel: item.nivel_academico || 'Sin grado',
        };
      });

      const totalInvestigadores = selectedInvestigadores.length;
      const totalPublicaciones = publications.reduce((acc, item) => acc + item.total, 0);
      const areaCounts = selectedInvestigadores.reduce((acc, item) => {
        const area = item.area_investigacion || 'Sin área';
        acc[area] = (acc[area] ?? 0) + 1;
        return acc;
      }, {});
      const nivelCounts = selectedInvestigadores.reduce((acc, item) => {
        const nivel = item.nivel_academico || 'Sin grado';
        acc[nivel] = (acc[nivel] ?? 0) + 1;
        return acc;
      }, {});
      const ranking = [...publications]
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const rows = selectedInvestigadores.map((item, index) => {
        const row = publications.find((pub) => pub.name === getDisplayName(item.user));
        return [
          String(index + 1),
          getDisplayName(item.user),
          item.nivel_academico || 'Sin dato',
          item.area_investigacion || 'Sin dato',
          String(row?.studiesCount || 0),
          String(row?.newsCount || 0),
          String(row?.total || 0),
        ];
      });

      downloadPdfReport({
        filename: 'reporte-investigadores-avanzado.pdf',
        title: 'Reporte de investigadores',
        subtitle: 'Incluye totales, ranking por publicaciones y distribución por área y grado académico.',
        summary: [
          ['Total de investigadores en el filtro', String(totalInvestigadores)],
          ['Total de publicaciones en el rango', String(totalPublicaciones)],
          ['Promedio de publicaciones por investigador', `${totalInvestigadores ? (totalPublicaciones / totalInvestigadores).toFixed(1) : '0.0'}`],
          ['Periodo', `${filter.from || 'inicio'} - ${filter.to || 'fin'}`],
        ],
        tables: [
          {
            label: 'Ranking de investigadores con más publicaciones',
            headers: ['Investigador', 'Estudios', 'Noticias', 'Total'],
            rows: ranking.map((item) => [item.name, String(item.studiesCount), String(item.newsCount), String(item.total)]),
          },
          {
            label: 'Distribución por área de investigación',
            headers: ['Área', 'Investigadores', 'Porcentaje'],
            rows: Object.entries(areaCounts).map(([area, count]) => [area, String(count), percent(count, totalInvestigadores)]),
          },
          {
            label: 'Distribución por grado académico',
            headers: ['Grado académico', 'Investigadores', 'Porcentaje'],
            rows: Object.entries(nivelCounts).map(([nivel, count]) => [nivel, String(count), percent(count, totalInvestigadores)]),
          },
          {
            label: 'Investigadores incluidos',
            headers: ['#', 'Nombre', 'Grado', 'Área', 'Estudios', 'Noticias', 'Total'],
            rows,
          },
        ],
      });
      return;
    }

    if (activeReportTab === 'estudios') {
      const filter = reportFilters.estudios;
      const records = getFilteredStudyRecordsForReport();
      const totalStudies = records.length;
      const studiesByInvestigator = records.reduce((acc, item) => {
        const key = getDisplayName(item.investigador?.user);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      const studiesByCategory = records.reduce((acc, item) => {
        const key = item.categoria || 'Sin categoría';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      const areas = records.reduce((acc, item) => {
        const key = item.investigador?.area_investigacion || 'Sin área';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      const withDocuments = records.filter((item) => Boolean(item.documento)).length;
      const withImages = records.filter((item) => Boolean(item.foto)).length;
      const months = getMonthsInRange(filter.from, filter.to);
      const topAuthor = Object.entries(studiesByInvestigator).sort((a, b) => b[1] - a[1])[0];
      const topArea = Object.entries(areas).sort((a, b) => b[1] - a[1])[0];

      downloadPdfReport({
        filename: 'reporte-estudios-avanzado.pdf',
        title: 'Reporte de estudios',
        subtitle: 'Estadísticas de estudios por autor, categoría, área y presencia de adjuntos.',
        summary: [
          ['Total de estudios en el rango', String(totalStudies)],
          ['Autor con más estudios', topAuthor ? topAuthor[0] : 'Sin datos'],
          ['Área con más estudios', topArea ? topArea[0] : 'Sin datos'],
          ['Promedio de estudios por mes', `${(totalStudies / months).toFixed(1)} por mes`],
          ['Estudios con documento', `${String(withDocuments)} (${percent(withDocuments, totalStudies)})`],
          ['Estudios con imagen', `${String(withImages)} (${percent(withImages, totalStudies)})`],
        ],
        tables: [
          {
            label: 'Total de estudios por investigador',
            headers: ['Investigador', 'Cantidad'],
            rows: Object.entries(studiesByInvestigator).map(([author, count]) => [author, String(count)]),
          },
          {
            label: 'Total de estudios por categoría',
            headers: ['Categoría', 'Cantidad'],
            rows: Object.entries(studiesByCategory).map(([category, count]) => [category, String(count)]),
          },
          {
            label: 'Estudios registrados',
            headers: ['#', 'Título', 'Autor', 'Categoría', 'Fecha', 'Documento', 'Imagen'],
            rows: records.map((item, index) => [
              String(index + 1),
              item.titulo || '',
              getDisplayName(item.investigador?.user),
              item.categoria || 'Sin categoría',
              formatDate(item.created_at || item.updated_at),
              item.documento ? 'Sí' : 'No',
              item.foto ? 'Sí' : 'No',
            ]),
          },
        ],
      });
      return;
    }

    if (activeReportTab === 'noticias') {
      const filter = reportFilters.noticias;
      const records = getFilteredNewsRecordsForReport();
      const totalNews = records.length;
      const newsByInvestigator = records.reduce((acc, item) => {
        const key = getDisplayName(item.investigador?.user);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      const topAuthors = Object.entries(newsByInvestigator)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      const newsByMonth = records.reduce((acc, item) => {
        const date = new Date(item.fecha || item.created_at);
        if (Number.isNaN(date.getTime())) {
          return acc;
        }
        const key = `${date.toLocaleString('es-MX', { month: 'short' })} ${date.getFullYear()}`;
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      const withImage = records.filter((item) => Boolean(item.foto)).length;
      const uniqueAuthors = Object.keys(newsByInvestigator).length;

      downloadPdfReport({
        filename: 'reporte-noticias-avanzado.pdf',
        title: 'Reporte de noticias',
        subtitle: 'Estadísticas de noticias por autor, mes y porcentaje de imagen publicada.',
        summary: [
          ['Total de noticias en el rango', String(totalNews)],
          ['Noticias con imagen publicada', `${String(withImage)} (${percent(withImage, totalNews)})`],
          ['Promedio de noticias por investigador', `${uniqueAuthors ? (totalNews / uniqueAuthors).toFixed(1) : '0.0'}`],
          ['Periodo', `${filter.from || 'inicio'} - ${filter.to || 'fin'}`],
        ],
        tables: [
          {
            label: 'Noticias por investigador',
            headers: ['Investigador', 'Cantidad'],
            rows: Object.entries(newsByInvestigator).map(([author, count]) => [author, String(count)]),
          },
          {
            label: 'Top 3 autores con más noticias',
            headers: ['Autor', 'Cantidad'],
            rows: topAuthors.map(([author, count]) => [author, String(count)]),
          },
          {
            label: 'Noticias por mes',
            headers: ['Mes', 'Cantidad'],
            rows: Object.entries(newsByMonth).map(([period, count]) => [period, String(count)]),
          },
        ],
      });
      return;
    }

    const filter = reportFilters.publicaciones;
    const { studies, news } = getFilteredPublicationRecordsForReport();
    const totalProjects = studies.length;
    const totalPublications = studies.length + news.length;
    const publicationsByArea = [...studies, ...news].reduce((acc, item) => {
      const key = item.investigador?.area_investigacion || 'Sin área';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const studyProjectsByInvestigator = studies.reduce((acc, item) => {
      const key = getDisplayName(item.investigador?.user);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const projectRanking = Object.entries(studyProjectsByInvestigator)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
    const topArea = Object.entries(publicationsByArea).sort((a, b) => b[1] - a[1])[0];
    const averagePublicationsByProject = totalProjects ? (totalPublications / totalProjects).toFixed(1) : '0.0';

    downloadPdfReport({
      filename: 'reporte-publicaciones-avanzado.pdf',
      title: 'Reporte de proyectos y publicaciones',
      subtitle: 'Incluye proyectos registrados, ranking de investigadores y distribución por área.',
      summary: [
        ['Total de proyectos registrados', String(totalProjects)],
        ['Total de publicaciones en el rango', String(totalPublications)],
        ['Promedio de publicaciones por proyecto', averagePublicationsByProject],
        ['Área con más publicaciones', topArea ? topArea[0] : 'Sin datos'],
        ['Periodo', `${filter.from || 'inicio'} - ${filter.to || 'fin'}`],
      ],
      tables: [
        {
          label: 'Ranking de investigadores con más proyectos',
          headers: ['#', 'Investigador', 'Proyectos'],
          rows: projectRanking.map((item, index) => [String(index + 1), item.name, String(item.count)]),
        },
        {
          label: 'Total de publicaciones por área',
          headers: ['Área', 'Publicaciones', 'Porcentaje'],
          rows: Object.entries(publicationsByArea).map(([area, count]) => [area, String(count), percent(count, totalPublications)]),
        },
      ],
    });
    return;
  };

  const renderReportSection = () => {
    if (activeReportTab === 'investigadores') {
      const filter = reportFilters.investigadores;
      const selectedInvestigadores = getFilteredInvestigadoresForReport();
      const totalInvestigadores = selectedInvestigadores.length;
      const publications = selectedInvestigadores.map((item) => {
        const studiesCount = estudios.filter(
          (study) => Number(study.investigador_id) === Number(item.id) && matchesDateRange(study.created_at || study.updated_at, filter.from, filter.to),
        ).length;
        const newsCount = noticias.filter(
          (newsItem) => Number(newsItem.investigador_id) === Number(item.id) && matchesDateRange(newsItem.fecha || newsItem.created_at, filter.from, filter.to),
        ).length;
        return {
          total: studiesCount + newsCount,
        };
      });
      const totalPublicaciones = publications.reduce((acc, item) => acc + item.total, 0);

      return renderReportMetricCards([
        { label: 'Investigadores incluidos', value: totalInvestigadores },
        { label: 'Publicaciones en el periodo', value: totalPublicaciones },
        { label: 'Promedio por investigador', value: `${totalInvestigadores ? (totalPublicaciones / totalInvestigadores).toFixed(1) : '0.0'}` },
        { label: 'Periodo', value: `${filter.from || 'inicio'} - ${filter.to || 'fin'}` },
      ]);
    }

    if (activeReportTab === 'estudios') {
      const filter = reportFilters.estudios;
      const records = getFilteredStudyRecordsForReport();
      const totalStudies = records.length;
      const withDocument = records.filter((item) => Boolean(item.documento)).length;
      const withImage = records.filter((item) => Boolean(item.foto)).length;
      const months = getMonthsInRange(filter.from, filter.to);
      const byInvestigator = records.reduce((acc, item) => {
        const key = getDisplayName(item.investigador?.user);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      const byArea = records.reduce((acc, item) => {
        const key = item.investigador?.area_investigacion || 'Sin área';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      const topAuthor = Object.entries(byInvestigator).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin datos';
      const topArea = Object.entries(byArea).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin datos';

      return renderReportMetricCards([
        { label: 'Total de estudios', value: totalStudies },
        { label: 'Autor con más estudios', value: topAuthor },
        { label: 'Área con más estudios', value: topArea },
        { label: 'Promedio por mes', value: `${(totalStudies / months).toFixed(1)}` },
        { label: 'Con documento adjunto', value: `${percent(withDocument, totalStudies)}` },
        { label: 'Con imagen publicada', value: `${percent(withImage, totalStudies)}` },
      ]);
    }

    if (activeReportTab === 'noticias') {
      const filter = reportFilters.noticias;
      const records = getFilteredNewsRecordsForReport();
      const totalNews = records.length;
      const authors = records.reduce((acc, item) => {
        const key = getDisplayName(item.investigador?.user);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      const topAuthor = Object.entries(authors).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin datos';
      const withImage = records.filter((item) => Boolean(item.foto)).length;
      const uniqueAuthors = Object.keys(authors).length;

      return renderReportMetricCards([
        { label: 'Total de noticias', value: totalNews },
        { label: 'Top autor', value: topAuthor },
        { label: 'Noticias con imagen', value: `${percent(withImage, totalNews)}` },
        { label: 'Promedio por investigador', value: `${uniqueAuthors ? (totalNews / uniqueAuthors).toFixed(1) : '0.0'}` },
        { label: 'Periodo', value: `${filter.from || 'inicio'} - ${filter.to || 'fin'}` },
      ]);
    }

    const filter = reportFilters.publicaciones;
    const { studies, news } = getFilteredPublicationRecordsForReport();
    const totalProjects = studies.length;
    const totalPublications = studies.length + news.length;
    const publicationsByArea = [...studies, ...news].reduce((acc, item) => {
      const key = item.investigador?.area_investigacion || 'Sin área';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const topArea = Object.entries(publicationsByArea).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin datos';
    const averagePublicationsByProject = totalProjects ? (totalPublications / totalProjects).toFixed(1) : '0.0';

    return renderReportMetricCards([
      { label: 'Total de proyectos', value: totalProjects },
      { label: 'Total de publicaciones', value: totalPublications },
      { label: 'Área con más publicaciones', value: topArea },
      { label: 'Promedio publicaciones por proyecto', value: averagePublicationsByProject },
      { label: 'Periodo', value: `${filter.from || 'inicio'} - ${filter.to || 'fin'}` },
    ]);
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

      <div className="form-grid form-grid--two">
        <div>
          <label htmlFor="consultores-mes">Mes de registro</label>
          <select
            id="consultores-mes"
            className="form-select"
            value={filters.consultores.mes}
            onChange={(event) => setSectionFilter('consultores', { mes: event.target.value })}
          >
            <option value="">Todos los meses</option>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>
        <div>
          <label htmlFor="consultores-anio">Año de registro</label>
          <input
            id="consultores-anio"
            className="form-input"
            type="number"
            min="2000"
            placeholder="Año"
            value={filters.consultores.anio}
            onChange={(event) => setSectionFilter('consultores', { anio: event.target.value })}
          />
        </div>
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
          <div>
            <label htmlFor="estudios-mes">Mes de publicación</label>
            <select
              id="estudios-mes"
              className="form-select"
              value={filters.estudios.mes}
              onChange={(event) => setSectionFilter('estudios', { mes: event.target.value })}
            >
              <option value="">Todos los meses</option>
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>
          <div>
            <label htmlFor="estudios-anio">Año de publicación</label>
            <input
              id="estudios-anio"
              className="form-input"
              type="number"
              min="2000"
              placeholder="Año"
              value={filters.estudios.anio}
              onChange={(event) => setSectionFilter('estudios', { anio: event.target.value })}
            />
          </div>
        </div>
      </div>
      <p className="muted-text">Filtros opcionales para refinar el PDF: autor, categoría y fecha de publicación.</p>

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
        <div>
          <label htmlFor="noticias-mes">Mes de publicación</label>
          <select
            id="noticias-mes"
            className="form-select"
            value={filters.noticias.mes}
            onChange={(event) => setSectionFilter('noticias', { mes: event.target.value })}
          >
            <option value="">Todos los meses</option>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>
        <div>
          <label htmlFor="noticias-anio">Año de publicación</label>
          <input
            id="noticias-anio"
            className="form-input"
            type="number"
            min="2000"
            placeholder="Año"
            value={filters.noticias.anio}
            onChange={(event) => setSectionFilter('noticias', { anio: event.target.value })}
          />
        </div>
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
          <option value="">Todos los tipos</option>
          <option value="estudio">Estudios</option>
          <option value="noticia">Noticias</option>
        </select>
        <input
          className="search-input"
          placeholder="Filtrar por publicación"
          value={filters.comentarios.publicacion}
          onChange={(event) => setSectionFilter('comentarios', { publicacion: event.target.value })}
        />
      </div>

      <div className="form-grid form-grid--two">
        <div>
          <label htmlFor="comentarios-mes">Mes de publicación</label>
          <select
            id="comentarios-mes"
            className="form-select"
            value={filters.comentarios.mes}
            onChange={(event) => setSectionFilter('comentarios', { mes: event.target.value })}
          >
            <option value="">Todos los meses</option>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>
        <div>
          <label htmlFor="comentarios-anio">Año de publicación</label>
          <input
            id="comentarios-anio"
            className="form-input"
            type="number"
            min="2000"
            placeholder="Año"
            value={filters.comentarios.anio}
            onChange={(event) => setSectionFilter('comentarios', { anio: event.target.value })}
          />
        </div>
      </div>

      <p className="muted-text">Filtros opcionales para refinar el PDF: tipo, publicación y fecha.</p>

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

      <section className="dashboard-section panel management-panel admin-report-section">
        <div className="section-head">
          <div>
            <h2>Reportes administrativos</h2>
            <p>Genera reportes con estadísticas y resúmenes por investigador, estudio, noticia o publicaciones.</p>
          </div>
        </div>

        <div className="report-panel">
          <section className="tab-bar">
            {REPORT_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`tab-button ${activeReportTab === section.id ? 'is-active' : ''}`}
                onClick={() => setActiveReportTab(section.id)}
              >
                {section.label}
              </button>
            ))}
          </section>

          {reportStatus.error ? <p className="status-box">{reportStatus.error}</p> : null}
          {reportStatus.success ? <p className="status-box">{reportStatus.success}</p> : null}

          <div className="report-tab-content">
            {activeReportTab === 'investigadores' ? (
              <div>
                <div className="section-head">
                  <div>
                    <h3>Reporte de investigadores</h3>
                    <p>Filtra por nombre, grado académico o área para obtener totales y ranking de investigadores.</p>
                  </div>
                  <button type="button" className="solid-link" onClick={() => buildAdminReport()}>
                    Generar PDF
                  </button>
                </div>

                <div className="form-grid form-grid--two">
                  <input
                    className="search-input"
                    placeholder="Buscar investigador"
                    value={reportFilters.investigadores.search}
                    onChange={(event) => setReportFilter('investigadores', { search: event.target.value })}
                  />
                  <input
                    className="search-input"
                    placeholder="Filtrar por grado académico"
                    value={reportFilters.investigadores.nivel}
                    onChange={(event) => setReportFilter('investigadores', { nivel: event.target.value })}
                  />
                </div>
                <div className="form-grid form-grid--two">
                  <input
                    className="search-input"
                    placeholder="Filtrar por área"
                    value={reportFilters.investigadores.area}
                    onChange={(event) => setReportFilter('investigadores', { area: event.target.value })}
                  />
                  <div className="form-grid form-grid--two">
                    <input
                      className="form-input"
                      type="date"
                      value={reportFilters.investigadores.from}
                      onChange={(event) => setReportFilter('investigadores', { from: event.target.value })}
                    />
                    <input
                      className="form-input"
                      type="date"
                      value={reportFilters.investigadores.to}
                      onChange={(event) => setReportFilter('investigadores', { to: event.target.value })}
                    />
                  </div>
                </div>

                {renderReportSection()}
              </div>
            ) : activeReportTab === 'estudios' ? (
              <div>
                <div className="section-head">
                  <div>
                    <h3>Reporte de estudios</h3>
                    <p>Analiza estudios por autor, categoría y rango de fechas con métricas de documento y área.</p>
                  </div>
                  <button type="button" className="solid-link" onClick={() => buildAdminReport()}>
                    Generar PDF
                  </button>
                </div>

                <div className="form-grid form-grid--two">
                  <input
                    className="search-input"
                    placeholder="Filtrar por autor"
                    value={reportFilters.estudios.autor}
                    onChange={(event) => setReportFilter('estudios', { autor: event.target.value })}
                  />
                  <input
                    className="search-input"
                    placeholder="Filtrar por categoría"
                    value={reportFilters.estudios.categoria}
                    onChange={(event) => setReportFilter('estudios', { categoria: event.target.value })}
                  />
                </div>
                <div className="form-grid form-grid--two">
                  <input
                    className="form-input"
                    type="date"
                    value={reportFilters.estudios.from}
                    onChange={(event) => setReportFilter('estudios', { from: event.target.value })}
                  />
                  <input
                    className="form-input"
                    type="date"
                    value={reportFilters.estudios.to}
                    onChange={(event) => setReportFilter('estudios', { to: event.target.value })}
                  />
                </div>

                {renderReportSection()}
              </div>
            ) : activeReportTab === 'noticias' ? (
              <div>
                <div className="section-head">
                  <div>
                    <h3>Reporte de noticias</h3>
                    <p>Revisa tendencias de noticias por autor y por mes, con indicadores de imagen y promedio por investigador.</p>
                  </div>
                  <button type="button" className="solid-link" onClick={() => buildAdminReport()}>
                    Generar PDF
                  </button>
                </div>

                <div className="form-grid form-grid--two">
                  <input
                    className="search-input"
                    placeholder="Filtrar por autor"
                    value={reportFilters.noticias.autor}
                    onChange={(event) => setReportFilter('noticias', { autor: event.target.value })}
                  />
                  <div className="form-grid form-grid--two">
                    <input
                      className="form-input"
                      type="date"
                      value={reportFilters.noticias.from}
                      onChange={(event) => setReportFilter('noticias', { from: event.target.value })}
                    />
                    <input
                      className="form-input"
                      type="date"
                      value={reportFilters.noticias.to}
                      onChange={(event) => setReportFilter('noticias', { to: event.target.value })}
                    />
                  </div>
                </div>

                {renderReportSection()}
              </div>
            ) : (
              <div>
                <div className="section-head">
                  <div>
                    <h3>Reporte de proyectos / publicaciones</h3>
                    <p>Genera estadísticas combinadas de proyectos, publicaciones y áreas por investigador.</p>
                  </div>
                  <button type="button" className="solid-link" onClick={() => buildAdminReport()}>
                    Generar PDF
                  </button>
                </div>

                <div className="form-grid form-grid--two">
                  <div>
                    <label htmlFor="report-investigator">Investigador</label>
                    <select
                      id="report-investigator"
                      className="form-select"
                      value={reportFilters.publicaciones.investigadorId}
                      onChange={(event) => setReportFilter('publicaciones', { investigadorId: event.target.value })}
                    >
                      <option value="">Todos los investigadores</option>
                      {reportInvestigatorOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-grid form-grid--two">
                    <input
                      className="form-input"
                      type="date"
                      value={reportFilters.publicaciones.from}
                      onChange={(event) => setReportFilter('publicaciones', { from: event.target.value })}
                    />
                    <input
                      className="form-input"
                      type="date"
                      value={reportFilters.publicaciones.to}
                      onChange={(event) => setReportFilter('publicaciones', { to: event.target.value })}
                    />
                  </div>
                </div>

                {renderReportSection()}
              </div>
            )}
          </div>
        </div>
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
