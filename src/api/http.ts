const TOKEN_KEY = 'salesflow.session.jwt';
const API_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const sessionToken = {
    get: () => sessionStorage.getItem(TOKEN_KEY),
    set: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
    clear: () => sessionStorage.removeItem(TOKEN_KEY)
};

export class ApiError extends Error {
    constructor(public status: number, message: string) { super(message); this.name = 'ApiError'; }
}

function errorMessage(body: unknown, fallback: string): string {
    if (!body || typeof body !== 'object') return fallback;
    const data = body as Record<string, unknown>;
    if (typeof data.detail === 'string' && data.detail) return data.detail;
    if (typeof data.message === 'string' && data.message) return data.message;
    if (Array.isArray(data.errors)) return data.errors.join(' · ');
    if (data.errors && typeof data.errors === 'object') return Object.values(data.errors).flat().join(' · ');
    if (typeof data.title === 'string') return data.title;
    return fallback;
}

export async function api<T>(path: string, options: RequestInit = {}, token = sessionToken.get()): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');
    if (options.body !== undefined) headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    let response: Response;
    try { response = await fetch(`${API_URL}${path}`, { ...options, headers }); }
    catch { throw new ApiError(0, 'API ilə əlaqə qurulmadı. Backend-in işlədiyini və Vite proxy portunu yoxla.'); }
    if (response.status === 204) return undefined as T;
    const contentType = response.headers.get('content-type') || '';
    const data: unknown = contentType.includes('application/json') ? await response.json().catch(() => null) : await response.text().catch(() => null);
    if (!response.ok) throw new ApiError(response.status, errorMessage(data, response.status === 401 ? 'Giriş tələb olunur və ya tenant seçilməyib.' : `Sorğu uğursuz oldu (${response.status}).`));
    return data as T;
}

export const get = <T>(path: string) => api<T>(path);
export const post = <T>(path: string, body?: unknown) => api<T>(path, { method: 'POST', ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
export const put = <T>(path: string, body: unknown) => api<T>(path, { method: 'PUT', body: JSON.stringify(body) });
export const patch = <T>(path: string, body?: unknown) => api<T>(path, { method: 'PATCH', ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });

export function queryString(params: Record<string, string | number | boolean | null | undefined>): string {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => { if (value !== null && value !== undefined && value !== '') qs.set(key, String(value)); });
    const text = qs.toString();
    return text ? `?${text}` : '';
}
