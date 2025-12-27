import api from './api';
import axios from 'axios';

type LoginResponse = {
  access_token?: string;
  token?: string;
  detail?: string;
};

export async function loginAdmin(username: string, password: string): Promise<string> {
  // Allow backend to validate admin credentials. Trim inputs to avoid accidental whitespace.
  username = username.trim();
  password = password.trim();

  const endpoints = ['/admin/login', '/admin/auth'];
  for (const ep of endpoints) {
    try {
      const resp = await api.post<LoginResponse>(ep, { username, password });
      const data = resp.data;
      const token = (data.access_token || data.token) as string;
      if (token) return token;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          // try next candidate
          continue;
        }
        const status = err.response?.status;
        const detail = err.response?.data?.detail || err.response?.data?.message || (err.response?.data ? JSON.stringify(err.response.data) : undefined);
        const msg = detail || err.message || 'Admin login failed';
        throw new Error(`${msg} (status ${status})`);
      }
      if (err instanceof Error) throw new Error(err.message);
      throw new Error(String(err));
    }
  }

  // fallback to token endpoint (form-encoded)
  try {
    const resp = await api.post('/token', new URLSearchParams({ username, password }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return (resp.data?.access_token || resp.data?.token) as string;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      throw new Error('No admin login endpoint found on the backend (404).');
    }
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || err.response?.data?.message || (err.response?.data ? JSON.stringify(err.response.data) : undefined);
      const msg = detail || err.message || String(err);
      throw new Error(`${msg} (status ${status})`);
    }
    if (err instanceof Error) throw new Error(err.message);
    throw new Error(String(err));
  }
}

/**
 * loginUser - general user login helper
 * Tries common endpoints and returns the access token string. If an endpoint
 * returns 404 it will try other candidates before failing with an informative error.
 */
export async function loginUser(username: string, password: string): Promise<string> {
  const endpoints = ['/login', '/user/login', '/auth/login'];

  for (const ep of endpoints) {
    try {
      const resp = await api.post<LoginResponse>(ep, { username, password });
      const data = resp.data;
      const token = (data.access_token || data.token) as string;
      if (token) return token;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          // try next endpoint
          continue;
        }
        const msg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Login failed';
        throw new Error(msg);
      }
      if (err instanceof Error) throw new Error(err.message);
      throw new Error(String(err));
    }
  }

  // fallback to token endpoint (form-encoded)
  try {
    const resp = await api.post('/token', new URLSearchParams({ username, password }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return (resp.data?.access_token || resp.data?.token) as string;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      throw new Error('No login endpoint found on the backend (404).');
    }
    if (axios.isAxiosError(err)) {
      const msg = err.response?.data?.detail || err.message || String(err);
      throw new Error(msg);
    }
    if (err instanceof Error) throw new Error(err.message);
    throw new Error(String(err));
  }
}

/**
 * Redirect the browser to a provider-based OAuth endpoint on the backend.
 * The backend is expected to implement either /auth/:provider for normal users
 * and /admin/auth/:provider for admin flows. The backend should handle the
 * provider handshake and redirect back to the app's callback URL with a token.
 */
export function loginWithProvider(provider: 'google' | 'microsoft', asAdmin = false) {
  const prefix = asAdmin ? '/admin/auth' : '/auth';
  // prefer axios instance baseURL when configured, else use relative path
  const base = api.defaults?.baseURL ?? '';
  const url = `${base}${prefix}/${provider}`;
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}
