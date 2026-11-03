import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { ArrowRightLeft, BarChart3, Bell, Building2, ChevronDown, ClipboardCheck, ContactRound, LayoutDashboard, Layers3, LogOut, Menu, Plus, Search, Settings2, ShieldCheck, Target, Users, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { initials, roleLabel } from '../utils/format';

const navigation = [
    { to: '/dashboard', label: 'İcmal', icon: LayoutDashboard },
    { to: '/customers', label: 'Müştərilər', icon: ContactRound },
    { to: '/leads', label: 'Potensial müştərilər', icon: Target },
    { to: '/deals', label: 'Satış pipeline-ı', icon: BarChart3 },
    { to: '/tasks', label: 'Tapşırıqlar', icon: ClipboardCheck }
];
export function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [workspaceMenu, setWorkspaceMenu] = useState(false);
    const [profileMenu, setProfileMenu] = useState(false);
    const [switching, setSwitching] = useState(false);
    const { user, workspace, workspaces, selectWorkspace, logout } = useAuth();
    const toast = useToast(); const navigate = useNavigate();
    async function switchWorkspace(id: string) {
        if (id === workspace?.tenantId) { setWorkspaceMenu(false); return; }
        setSwitching(true);
        try { await selectWorkspace(id); navigate('/dashboard'); setWorkspaceMenu(false); toast('İş mühiti dəyişdirildi.'); }
        catch (err) { toast(err instanceof Error ? err.message : 'İş mühiti dəyişdirilmədi.', 'error'); }
        finally { setSwitching(false); }
    }
    return <div className="app-shell">
        {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-top"><NavLink to="/dashboard" className="brand brand-white" onClick={() => setSidebarOpen(false)}><span className="brand-logo"><Layers3 size={21}/></span><span>salesflow<span className="brand-dot">.</span></span></NavLink><button className="mobile-close icon-btn" aria-label="Menyunu bağla" onClick={() => setSidebarOpen(false)}><X size={18}/></button></div>
            <button className="workspace-switcher" onClick={() => setWorkspaceMenu(x => !x)} disabled={switching}><div className="workspace-logo">{initials(workspace?.name || 'SF')}</div><div className="workspace-summary"><strong>{workspace?.name || 'Şirkət'}</strong><small>{roleLabel(workspace?.role || 'Sales')} · Workspace</small></div><ChevronDown size={16}/></button>
            {workspaceMenu && <div className="workspace-dropdown"><div className="dropdown-title">İş mühitləri</div>{workspaces.map(space => <button key={space.tenantId} className={space.tenantId === workspace?.tenantId ? 'active-option' : ''} onClick={() => void switchWorkspace(space.tenantId)}><Building2 size={16}/><span>{space.name}</span>{space.tenantId === workspace?.tenantId && <span>✓</span>}</button>)}<button onClick={() => navigate('/onboarding')}><Plus size={16}/> Yeni şirkət</button></div>}
            <div className="sidebar-group-label">İŞ SAHƏSİ</div><nav className="sidebar-nav">{navigation.map(item => <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><item.icon size={19}/><span>{item.label}</span></NavLink>)}</nav>
            <div className="sidebar-group-label sidebar-group-second">İDARƏETMƏ</div><nav className="sidebar-nav"><NavLink to="/members" onClick={() => setSidebarOpen(false)} className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><Users size={19}/> <span>Əməkdaşlar</span></NavLink><NavLink to="/settings" onClick={() => setSidebarOpen(false)} className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><Settings2 size={19}/> <span>Parametrlər</span></NavLink></nav>
            <div className="sidebar-spacer"/><div className="sidebar-bottom-card"><div className="sidebar-bottom-icon"><ShieldCheck size={18}/></div><strong>Məlumatlarınız qorunur</strong><p>Şirkət məlumatları tenant üzrə təcrid olunur.</p></div>
            <div className="sidebar-bottom-note"><span className="small-online"/> SalesFlow Cloud <span>v1.0</span></div>
        </aside>
        <div className="main-column"><header className="topbar"><div className="topbar-left"><button type="button" className="mobile-menu icon-btn" aria-label="Menyunu aç" onClick={() => setSidebarOpen(true)}><Menu size={21}/></button><div className="breadcrumbs"><span>İş mühiti</span><span className="breadcrumb-sep">/</span><strong>{workspace?.name}</strong></div></div>
            <div className="topbar-right"><span className="server-badge"><span className="server-dot"/> API bağlantısı</span><button className="top-icon" aria-label="Axtarış" onClick={() => document.querySelector<HTMLInputElement>('.global-filter-input')?.focus()}><Search size={19}/></button><button className="top-icon" aria-label="Bildirişlər" title="Bildiriş modulu sonrakı mərhələdə hazırlanacaq" onClick={() => toast('Bildiriş mərkəzi hələ backend-də mövcud deyil.') }><Bell size={19}/></button><div className="top-divider"/><div className="profile-container"><button className="profile-button" onClick={() => setProfileMenu(x=>!x)}><span className="profile-avatar">{initials(user?.displayName || 'U')}</span><span className="profile-text"><strong>{user?.displayName}</strong><small>{roleLabel(workspace?.role || 'Sales')}</small></span><ChevronDown size={16}/></button>{profileMenu && <div className="profile-menu"><div className="profile-menu-title">{user?.email}</div><button onClick={() => { navigate('/workspaces'); setProfileMenu(false); }}><ArrowRightLeft size={16}/> Şirkət dəyiş</button><button onClick={() => { logout(); navigate('/login'); }}><LogOut size={16}/> Çıxış</button></div>}</div></div>
        </header><main className="content"><Outlet/></main><footer className="app-footer"><span>© 2026 SalesFlow Cloud</span><span>Designed for teams that sell smarter.</span></footer></div>
    </div>;
}
