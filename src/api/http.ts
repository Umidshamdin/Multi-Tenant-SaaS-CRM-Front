
import type { AuthToken } from './types';

const TOKEN_KEY = 'salesflow-session';

export const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:7206/api').replace(/\/+$/, '');

export function readSession(): AuthToken | null {
    try {
        const raw = sessionStorage.getItem(TOKEN_KEY);
        return raw ? JSON.parse(raw) as AuthToken : null;
    } catch {
        return null;
    }
}

export function writeSession(token: AuthToken | null) {
    if (token) sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    else sessionStorage.removeItem(TOKEN_KEY);
}


export class ApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}


export function qs(params: Record<string, string | number | boolean | null | undefined> = {}) {
    const q = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value) !== '')
            q.set(key, String(value));
    });

    const s = q.toString();
    return s ? `?${s}` : '';
}

async function request<T>(method: string, route: string, payload?: unknown): Promise<T> {
    const token = readSession();

    if (token && Date.parse(token.expiresAtUtc) <= Date.now()) {
        writeSession(null);
        window.dispatchEvent(new Event('salesflow:expired'));
        throw new ApiError('Sessiyanın vaxtı bitib. Yenidən daxil olun.', 401);
    }

    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 30000);

    try {
        const response = await fetch(`${baseUrl}${route.startsWith('/') ? route : `/${route}`}`, {
            method,
            signal: abort.signal,
            headers: {
                Accept: 'application/json',
                ...(payload === undefined ? {} : { 'Content-Type': 'application/json' }),
                ...(token ? { Authorization: `Bearer ${token.accessToken}` } : {})
            },
            body: payload === undefined ? undefined : JSON.stringify(payload)
        });

        if (response.status === 401) {
            writeSession(null);
            window.dispatchEvent(new Event('salesflow:expired'));
        }

        if (response.status === 204) return undefined as T;

        const text = await response.text();
        let data: unknown = text;

        try {
            if (text) data = JSON.parse(text);
        } catch {
            // Backend plain text qaytara bilər.
        }

        if (!response.ok) {
            const obj = (typeof data === 'object' && data ? data : {}) as Record<string, unknown>;

            const errors = obj.errors && typeof obj.errors === 'object'
                ? Object.values(obj.errors).flat().join(' • ')
                : '';

            const message = String(
                errors || obj.detail || obj.message || obj.title ||
                (response.status === 404
                    ? 'Məlumat tapılmadı və ya endpoint mövcud deyil.'
                    : `API xətası: ${response.status}`)
            );

            throw new ApiError(message, response.status);
        }

        return data as T;
    } catch (error) {
        if (error instanceof ApiError) throw error;

        if (error instanceof DOMException && error.name === 'AbortError')
            throw new ApiError('Sorğunun vaxtı bitdi.', 408);

        throw new ApiError(
            'Backend ilə əlaqə yaradılmadı. API ünvanını, HTTPS sertifikatını və CORS-u yoxla.',
            0
        );
    } finally {
        clearTimeout(timer);
    }
}

export const http = {
    get: <T>(route: string) => request<T>('GET', route),
    post: <T>(route: string, payload?: unknown) => request<T>('POST', route, payload),
    put: <T>(route: string, payload?: unknown) => request<T>('PUT', route, payload),
    patch: <T>(route: string, payload?: unknown) => request<T>('PATCH', route, payload),
    delete: <T>(route: string) => request<T>('DELETE', route)
};

export function localOffsetIso(value: string): string | null {
    if (!value) return null;

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;

    const mins = -d.getTimezoneOffset();
    const sign = mins >= 0 ? '+' : '-';
    const pad = (n: number) => String(n).padStart(2, '0');

    return `${value.length === 16 ? `${value}:00` : value}${sign}${pad(Math.floor(Math.abs(mins) / 60))}:${pad(Math.abs(mins) % 60)}`;
}

export function toDateInput(value?: string) {
    return value ? value.slice(0, 10) : '';
}

export function errorText(error: unknown): string {
    return error instanceof Error ? error.message : 'Naməlum xəta baş verdi.';
}
