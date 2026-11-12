
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from 'react';

import { authApi, tenantApi } from '../api/salesflow';
import { readSession, writeSession } from '../api/http';
import type { AuthToken, Profile, Workspace } from '../api/types';

type WorkspaceInput = {
    name: string;
    slug: string;
    legalName: string;
};

type AuthContextValue = {
    token: AuthToken | null;
    user: Profile | null;
    workspace: Workspace | null;
    workspaces: Workspace[];
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    select: (tenantId: string) => Promise<void>;
    selectWorkspace: (tenantId: string) => Promise<void>;
    switchWorkspace: (tenantId: string) => Promise<void>;
    refreshWorkspaces: () => Promise<void>;
    createWorkspace: (data: WorkspaceInput) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<AuthToken | null>(readSession);
    const [user, setUser] = useState<Profile | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);

    const saveSession = useCallback((value: AuthToken | null) => {
        writeSession(value);
        setToken(value);

        if (!value) {
            setUser(null);
            setWorkspaces([]);
        }
    }, []);

    const loadProfile = useCallback(async () => {
        const [profile, list] = await Promise.all([
            authApi.me(),
            authApi.workspaces()
        ]);

        setUser(profile);
        setWorkspaces(list);
    }, []);

    useEffect(() => {
        let active = true;

        async function initialize() {
            try {
                if (readSession()) await loadProfile();
            } catch {
                if (active) saveSession(null);
            } finally {
                if (active) setLoading(false);
            }
        }

        void initialize();

        const onExpired = () => saveSession(null);

        window.addEventListener('salesflow:expired', onExpired);

        return () => {
            active = false;
            window.removeEventListener('salesflow:expired', onExpired);
        };
    }, [loadProfile, saveSession]);

    async function login(email: string, password: string) {
        const result = await authApi.login(email, password);
        saveSession(result);

        await loadProfile();
    }

    async function register(name: string, email: string, password: string) {
        const result = await authApi.register(name, email, password);
        saveSession(result);

        await loadProfile();
    }

    async function select(tenantId: string) {
        const result = await authApi.select(tenantId);

        saveSession(result);
        setUser(await authApi.me());
    }

    async function refreshWorkspaces() {
        const list = await authApi.workspaces();
        setWorkspaces(list);
    }

    async function createWorkspace(data: WorkspaceInput) {
        const result = await tenantApi.create(data);

        await refreshWorkspaces();
        await select(result.tenant.id);
    }

    function logout() {
        saveSession(null);
    }

    const activeTenantId = user?.activeTenantId ?? token?.tenantId;

    const workspace = workspaces.find(
        x => x.tenantId === activeTenantId
    ) ?? null;

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                workspace,
                workspaces,
                loading,
                login,
                register,
                select,
                selectWorkspace: select,
                switchWorkspace: select,
                refreshWorkspaces,
                createWorkspace,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('AuthProvider missing');
    }

    return context;
}
