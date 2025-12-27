import axios, { type AxiosRequestHeaders } from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

if (typeof window !== 'undefined') {
  // Attach token from localStorage on each request
  api.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem('admin_token');
      // Ensure headers are set with Axios types and set Authorization consistently
      config.headers = { ...(config.headers as AxiosRequestHeaders | Record<string, string | undefined>), Authorization: token ? `Bearer ${token}` : undefined } as AxiosRequestHeaders;
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[api] request', config.method, config.url, 'auth?', !!token);
      }
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') console.warn('[api] request attach token failed', e);
    }
    return config;
  });

  // Handle 401 responses globally
  api.interceptors.response.use(
    (resp) => resp,
    (error) => {
      if (error?.response?.status === 401) {
        try {
          localStorage.removeItem('admin_token');
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[api] received 401, removed admin_token');
          }
          // notify other parts of the app so the UI can prompt re-authentication
          try {
            window.dispatchEvent(new CustomEvent('admin:unauthorized', { detail: { status: 401 } }));
          } catch {}
          // optional: reload so UI updates
          // window.location.reload();
        } catch {
          // ignore
        }
      }
      return Promise.reject(error);
    }
  );
}

export default api;
