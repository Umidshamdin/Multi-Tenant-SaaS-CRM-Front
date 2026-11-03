import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, tenantApi } from '../api/salesflow';
import { sessionToken } from '../api/http';
import type { UserProfile, Workspace } from '../api/types';

interface AuthContextValue {
    loading: boolean;
    user: UserProfile | null;
    workspaces: Workspace[];
    workspace: Workspace | null;
    error: string | null;
    login(email: string, password: string): Promise<void>;
    register(email: string, password: string, displayName: string): Promise<void>;
    selectWorkspace(tenantId: string): Promise<void>;
    createWorkspace(data: Parameters<typeof tenantApi.create>[0]): Promise<void>;
    refreshWorkspaces(): Promise<void>;
    logout(): void;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [error, setError] = useState<string | null>(null);
    const initialized = useRef(false);
    const workspace = workspaces.find(x => x.tenantId === user?.activeTenantId) || null;

    const logout = useCallback(() => {
        sessionToken.clear();
        queryClient.clear();
        setUser(null);
        setWorkspaces([]);
        setError(null);
    }, [queryClient]);

    const refreshWorkspaces = useCallback(async () => {
        const next = await authApi.workspaces();
        setWorkspaces(next);
    }, []);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        async function load() {
            if (!sessionToken.get()) { setLoading(false); return; }
            try {
                const [profile, spaces] = await Promise.all([authApi.me(), authApi.workspaces()]);
                setUser(profile);
                setWorkspaces(spaces);
            } catch { sessionToken.clear(); queryClient.clear(); setUser(null); setWorkspaces([]); }
            finally { setLoading(false); }
        }
        void load();
    }, [queryClient]);

    async function finishAuthentication(token: string) {
        sessionToken.set(token);
        queryClient.clear();
        try {
            const [profile, spaces] = await Promise.all([authApi.me(), authApi.workspaces()]);
            setUser(profile);
            setWorkspaces(spaces);
            setError(null);
        } catch (err) { logout(); throw err; }
    }

    async function login(email: string, password: string) {
        const token = await authApi.login(email, password);
        await finishAuthentication(token.accessToken);
    }
    async function register(email: string, password: string, displayName: string) {
        const token = await authApi.register(email, password, displayName);
        await finishAuthentication(token.accessToken);
    }
    async function selectWorkspace(tenantId: string) {
        const token = await authApi.selectTenant(tenantId);
        await finishAuthentication(token.accessToken);
    }
    async function createWorkspace(data: Parameters<typeof tenantApi.create>[0]) {
        const result = await tenantApi.create(data);
        await refreshWorkspaces();
        await selectWorkspace(result.tenant.id);
    }
    return <AuthContext.Provider value={{ loading, user, workspaces, workspace, error, login, register, selectWorkspace, createWorkspace, refreshWorkspaces, logout }}>
        {children}
    </AuthContext.Provider>;
}
export function useAuth() {
    const value = useContext(AuthContext);
    if (!value) throw new Error('useAuth must be called inside AuthProvider.');
    return value;
}
