const API_PREFIX = '/api';

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: text || 'Invalid response' };
  }
}

/**
 * @param {string} path - e.g. '/books' or '/books?page=1'
 * @param {RequestInit} [options]
 */
export async function api(path, options = {}) {
  const url = `${API_PREFIX}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = { Accept: 'application/json', ...options.headers };
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(url, { ...options, headers });
  const data = await parseBody(res);
  if (!res.ok) {
    const msg = data?.message || res.statusText;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const apiGet = (path) => api(path, { method: 'GET' });
export const apiPost = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });
export const apiPut = (path, body) => api(path, { method: 'PUT', body: JSON.stringify(body) });
export const apiPatch = (path, body) => api(path, { method: 'PATCH', body: JSON.stringify(body) });
export const apiDelete = (path) => api(path, { method: 'DELETE' });
