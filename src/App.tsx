
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { Loading } from './components/UI';

import { AuthPage, WorkspacePage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { ContactsPage } from './pages/ContactsPage';
import { LeadsPage } from './pages/LeadsPage';
import { DealsPage } from './pages/DealsPage';
import { TasksPage } from './pages/TasksPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { ProductsPage } from './pages/ProductsPage';
import { QuotesPage } from './pages/QuotesPage';
import { OrdersPage } from './pages/OrdersPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PipelinesPage } from './pages/PipelinesPage';
import { NotesPage } from './pages/NotesPage';
import { TagsPage } from './pages/TagsPage';
import { CustomFieldsPage } from './pages/CustomFieldsPage';
import { GoalsPage } from './pages/GoalsPage';
import { AuditPage } from './pages/AuditPage';
import { MembersPage } from './pages/MembersPage';
import { SettingsPage } from './pages/SettingsPage';

function Protected() {
    const { token, user, loading } = useAuth();

    if (loading) {
        return <div className="boot-screen"><Loading/></div>;
    }

    if (!token) return <Navigate to="/login" replace/>;

    if (!user?.activeTenantId) {
        return <Navigate to="/workspaces" replace/>;
    }

    return <Outlet/>;
}

function WorkspaceGuard() {
    const { token, loading } = useAuth();

    if (loading) {
        return <div className="boot-screen"><Loading/></div>;
    }

    if (!token) return <Navigate to="/login" replace/>;

    return <Outlet/>;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<AuthPage/>}/>
            <Route path="/register" element={<AuthPage register/>}/>

            <Route element={<WorkspaceGuard/>}>
                <Route path="/workspaces" element={<WorkspacePage/>}/>
                <Route path="/onboarding" element={<Navigate to="/workspaces" replace/>}/>
            </Route>

            <Route element={<Protected/>}>
                <Route element={<AppLayout/>}>
                    <Route path="/dashboard" element={<DashboardPage/>}/>
                    <Route path="/customers" element={<CustomersPage/>}/>
                    <Route path="/contacts" element={<ContactsPage/>}/>
                    <Route path="/leads" element={<LeadsPage/>}/>
                    <Route path="/deals" element={<DealsPage/>}/>
                    <Route path="/tasks" element={<TasksPage/>}/>
                    <Route path="/activities" element={<ActivitiesPage/>}/>
                    <Route path="/products" element={<ProductsPage/>}/>
                    <Route path="/quotes" element={<QuotesPage/>}/>
                    <Route path="/orders" element={<OrdersPage/>}/>
                    <Route path="/invoices" element={<InvoicesPage/>}/>
                    <Route path="/pipelines" element={<PipelinesPage/>}/>
                    <Route path="/notes" element={<NotesPage/>}/>
                    <Route path="/tags" element={<TagsPage/>}/>
                    <Route path="/custom-fields" element={<CustomFieldsPage/>}/>
                    <Route path="/goals" element={<GoalsPage/>}/>
                    <Route path="/audit" element={<AuditPage/>}/>
                    <Route path="/members" element={<MembersPage/>}/>
                    <Route path="/settings" element={<SettingsPage/>}/>
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
    );
}
