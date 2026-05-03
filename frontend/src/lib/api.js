import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 15000,
});

/* Attach token on every request */
API.interceptors.request.use(cfg => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

/* Normalise errors */
API.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  },
);

export default API;

/* ── Auth ──────────────────────────────────────────────────── */
export const authAPI = {
  register: data        => API.post('/api/auth/register', data),
  login:    data        => API.post('/api/auth/login',    data),
  me:       ()          => API.get('/api/auth/me'),
};

/* ── Toilets ───────────────────────────────────────────────── */
export const toiletAPI = {
  list:         params  => API.get('/api/toilets',           { params }),
  get:          id      => API.get(`/api/toilets/${id}`),
  create:       form    => API.post('/api/toilets',          form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:       (id, f) => API.put(`/api/toilets/${id}`,     f,    { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:       id      => API.delete(`/api/toilets/${id}`),
  updateStatus: (id, s) => API.patch(`/api/toilets/${id}/status`, { status: s }),
  stats:        ()      => API.get('/api/toilets/stats'),
};

/* ── Reviews ───────────────────────────────────────────────── */
export const reviewAPI = {
  list:   params        => API.get('/api/reviews',      { params }),
  create: data          => API.post('/api/reviews',     data),
  update: (id, data)    => API.put(`/api/reviews/${id}`, data),
  delete: id            => API.delete(`/api/reviews/${id}`),
};
