const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('compliance_token');
  const headers = {
    ...options.headers
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData vs JSON
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'Network request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/auth/me'),
  getUsers: () => apiRequest('/auth/users'),

  // Obligations
  getObligations: (params = '') => apiRequest(`/obligations${params ? '?' + params : ''}`),
  getObligation: (id, asOfDate = '') => apiRequest(`/obligations/${id}${asOfDate ? '?asOfDate=' + asOfDate : ''}`),
  createObligation: (payload) => apiRequest('/obligations', { method: 'POST', body: JSON.stringify(payload) }),
  renewObligation: (id, payload) => apiRequest(`/obligations/${id}/renew`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteObligation: (id) => apiRequest(`/obligations/${id}`, { method: 'DELETE' }),

  // Documents
  uploadDocument: (formData) => apiRequest('/documents/upload', { method: 'POST', body: formData }),

  // Dashboard & Worker
  getDashboard: () => apiRequest('/dashboard/summary'),
  getMyTasks: () => apiRequest('/dashboard/my-tasks'),
  runWorker: (payload) => apiRequest('/dashboard/run-worker', { method: 'POST', body: JSON.stringify(payload) }),
  getEmailLogs: () => apiRequest('/dashboard/email-logs')
};
