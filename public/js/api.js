(function () {
  const base = window.__API_BASE__ || '/api';

  async function parseBody(res) {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, message: text || 'Invalid response' };
    }
  }

  window.api = {
    base,

    async request(path, options = {}) {
      const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
      const headers = { Accept: 'application/json', ...options.headers };
      if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
      const res = await fetch(url, { ...options, headers });
      const data = await parseBody(res);
      if (!res.ok) {
        const msg = data && data.message ? data.message : res.statusText;
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    },

    get(path) {
      return this.request(path, { method: 'GET' });
    },

    post(path, body) {
      return this.request(path, { method: 'POST', body: JSON.stringify(body) });
    },

    put(path, body) {
      return this.request(path, { method: 'PUT', body: JSON.stringify(body) });
    },

    patch(path, body) {
      return this.request(path, { method: 'PATCH', body: JSON.stringify(body) });
    },

    del(path) {
      return this.request(path, { method: 'DELETE' });
    },
  };
})();
