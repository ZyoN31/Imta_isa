import axios from 'axios';

const TOKEN_KEY = 'imta_token';
const USER_KEY = 'imta_user';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
const PUBLIC_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function setSession({ access_token: token, user }) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function resolveBackendUrl(value) {
  if (!value) {
    return '';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${PUBLIC_BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

export function getDisplayName(user) {
  if (!user) {
    return 'Usuario sin cuenta';
  }

  return [user.nombre, user.apellido_paterno, user.apellido_materno]
    .filter(Boolean)
    .join(' ')
    .trim() || user.email || 'Usuario';
}

export function getRoleLabel(role) {
  switch (role) {
    case 'administrador':
      return 'Administrador';
    case 'investigador':
      return 'Investigador';
    default:
      return 'Consultor';
  }
}

export function formatApiError(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.errors) {
    return Object.values(error.response.data.errors).flat().join(' ');
  }

  return 'No fue posible completar la solicitud.';
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/me');
  return data;
}

export async function login(credentials) {
  const { data } = await api.post('/login', credentials);
  return data;
}

export async function registerUser(payload) {
  const { data } = await api.post('/register', payload);
  return data;
}

export async function logout() {
  const { data } = await api.post('/logout');
  return data;
}

export async function fetchInvestigadores() {
  const { data } = await api.get('/investigadores');
  return data;
}

export async function fetchInvestigador(id) {
  const { data } = await api.get(`/investigadores/${id}`);
  return data;
}

export async function fetchEstudios() {
  const { data } = await api.get('/estudios');
  return data;
}

export async function fetchEstudio(id) {
  const { data } = await api.get(`/estudios/${id}`);
  return data;
}

export async function fetchNoticias() {
  const { data } = await api.get('/noticias');
  return data;
}

export async function fetchAdminConsultores() {
  const { data } = await api.get('/admin/consultores');
  return data;
}

export async function fetchAdminComentarios() {
  const { data } = await api.get('/admin/comentarios');
  return data;
}

export async function fetchNoticia(id) {
  const { data } = await api.get(`/noticias/${id}`);
  return data;
}

export async function createComentario(payload) {
  const { data } = await api.post('/comentarios', payload);
  return data;
}

export async function deleteComentario(id) {
  const { data } = await api.delete(`/comentarios/${id}`);
  return data;
}

export async function deleteInvestigador(id) {
  const { data } = await api.delete(`/investigadores/${id}`);
  return data;
}

export async function deleteEstudio(id) {
  const { data } = await api.delete(`/estudios/${id}`);
  return data;
}

export async function deleteNoticia(id) {
  const { data } = await api.delete(`/noticias/${id}`);
  return data;
}

function buildMultipartPayload(payload) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}

export async function createInvestigador(payload) {
  const formData = buildMultipartPayload(payload);
  const { data } = await api.post('/investigadores', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function createEstudio(payload) {
  const formData = buildMultipartPayload(payload);
  const { data } = await api.post('/estudios', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function createNoticia(payload) {
  const formData = buildMultipartPayload(payload);
  const { data } = await api.post('/noticias', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}