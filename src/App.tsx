import type { ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import { useAuth } from './contexts/AuthContext';
import { Loading } from './components/UI';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage, RegisterPage, OnboardingPage, WorkspacesPage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { LeadsPage } from './pages/LeadsPage';
import { DealsPage } from './pages/DealsPage';
import { TasksPage } from './pages/TasksPage';
import { MembersPage } from './pages/MembersPage';
import { SettingsPage } from './pages/SettingsPage';

function Protected() {
    const { loading, user, workspace } = useAuth();
    const location = useLocation();
    if (loading) return <div className="boot-screen"><Loading label="SalesFlow hazırlanır..."/></div>;
    if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace/>;
    if (!workspace) return <Navigate to="/workspaces" replace/>;
    return <Outlet/>;
}
function GuestOnly({ children }: { children: ReactNode }) {
    const { loading, user, workspace } = useAuth();
    if (loading) return <div className="boot-screen"><Loading/></div>;
    if (user) return <Navigate to={workspace ? '/dashboard' : '/workspaces'} replace/>;
    return children;
}
function WorkspacesGuard({ children }: { children: ReactNode }) {
    const { loading, user } = useAuth();
    if (loading) return <div className="boot-screen"><Loading/></div>;
    if (!user) return <Navigate to="/login" replace/>;
    return children;
}
export default function App() {
    return <Routes>
        <Route path="/login" element={<GuestOnly><LoginPage/></GuestOnly>}/>
        <Route path="/register" element={<GuestOnly><RegisterPage/></GuestOnly>}/>
        <Route path="/workspaces" element={<WorkspacesGuard><WorkspacesPage/></WorkspacesGuard>}/>
        <Route path="/onboarding" element={<WorkspacesGuard><OnboardingPage/></WorkspacesGuard>}/>
        <Route element={<Protected/>}>
            <Route element={<AppLayout/>}>
                <Route path="/dashboard" element={<DashboardPage/>}/>
                <Route path="/customers" element={<CustomersPage/>}/>
                <Route path="/leads" element={<LeadsPage/>}/>
                <Route path="/deals" element={<DealsPage/>}/>
                <Route path="/tasks" element={<TasksPage/>}/>
                <Route path="/members" element={<MembersPage/>}/>
                <Route path="/settings" element={<SettingsPage/>}/>
            </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
    </Routes>;
}
