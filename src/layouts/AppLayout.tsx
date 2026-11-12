
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    Activity,
    ArrowRightLeft,
    BarChart3,
    Bell,
    Building2,
    ClipboardCheck,
    ContactRound,
    FileText,
    GitBranch,
    LayoutDashboard,
    ListFilter,
    LogOut,
    Menu,
    Package,
    Plus,
    Receipt,
    Search,
    Settings2,
    ShieldCheck,
    ShoppingCart,
    StickyNote,
    Tags,
    Target,
    Users,
    X
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { initials, roleLabel } from '../utils/format';

const navigation = [
    {
        title: 'ƏSAS',
        items: [
            { to: '/dashboard', label: 'İcmal', icon: LayoutDashboard },
            { to: '/customers', label: 'Müştərilər', icon: ContactRound },
            { to: '/contacts', label: 'Əlaqəli şəxslər', icon: Users },
            { to: '/leads', label: 'Potensial müştərilər', icon: Target },
            { to: '/deals', label: 'Satış fürsətləri', icon: BarChart3 },
            { to: '/tasks', label: 'Tapşırıqlar', icon: ClipboardCheck },
            { to: '/activities', label: 'Fəaliyyətlər', icon: Activity }
        ]
    },
    {
        title: 'SATIŞ İDARƏETMƏSİ',
        items: [
            { to: '/products', label: 'Məhsullar', icon: Package },
            { to: '/pipelines', label: 'Satış pipeline-ları', icon: GitBranch },
            { to: '/quotes', label: 'Qiymət təklifləri', icon: FileText },
            { to: '/orders', label: 'Sifarişlər', icon: ShoppingCart },
            { to: '/invoices', label: 'Hesab-fakturalar', icon: Receipt },
            { to: '/goals', label: 'Satış hədəfləri', icon: Target }
        ]
    },
    {
        title: 'CRM ALƏTLƏRİ',
        items: [
            { to: '/notes', label: 'Qeydlər', icon: StickyNote },
            { to: '/tags', label: 'Etiketlər', icon: Tags },
            { to: '/custom-fields', label: 'Fərdi sahələr', icon: ListFilter }
        ]
    },
    {
        title: 'İDARƏETMƏ',
        items: [
            { to: '/members', label: 'Əməkdaşlar', icon: Users },
            { to: '/audit', label: 'Əməliyyat tarixçəsi', icon: ShieldCheck },
            { to: '/settings', label: 'Parametrlər', icon: Settings2 }
        ]
    }
];

export function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [switching, setSwitching] = useState(false);

    const {
        user,
        workspace,
        workspaces,
        selectWorkspace,
        logout
    } = useAuth();

    const toast = useToast();
    const navigate = useNavigate();

    async function switchWorkspace(id: string) {
        if (!id || id === workspace?.tenantId) return;

        setSwitching(true);

        try {
            await selectWorkspace(id);
            setSidebarOpen(false);
            navigate('/dashboard');
            toast('İş mühiti uğurla dəyişdirildi.');
        } catch (err) {
            toast(
                err instanceof Error
                    ? err.message
                    : 'İş mühiti dəyişdirilmədi.',
                'error'
            );
        } finally {
            setSwitching(false);
        }
    }

    function handleLogout() {
        logout();
        setSidebarOpen(false);
        navigate('/login', { replace: true });
    }

    function handleSearch() {
        const input = document.querySelector<HTMLInputElement>(
            '.global-filter-input, .toolbar input'
        );

        if (input) {
            input.focus();
        } else {
            toast('Bu səhifədə axtarış sahəsi mövcud deyil.', 'info');
        }
    }

    function handleNotifications() {
        toast('Bildiriş mərkəzi hələ hazırlanmayıb.', 'info');
    }

    return (
        <div className="app-shell">
            {sidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="brand">
                    <div className="brand-mark">
                        <BarChart3 size={23}/>
                    </div>

                    <div>
                        <strong>SalesFlow</strong>
                        <small>Cloud CRM</small>
                    </div>

                    <button
                        type="button"
                        className="mobile-close icon-btn"
                        aria-label="Menyunu bağla"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20}/>
                    </button>
                </div>

                <div className="workspace-box">
                    <div className="workspace-avatar">
                        {initials(workspace?.name || 'SF')}
                    </div>

                    <div className="workspace-text">
                        <span>Aktiv iş mühiti</span>
                        <strong>{workspace?.name || 'Şirkət seçilməyib'}</strong>
                        <span>
                            {roleLabel(workspace?.role || 'Sales')}
                        </span>
                    </div>

                    <Building2 size={17}/>
                </div>

                <div className="sidebar-scroll">
                    {navigation.map(group => (
                        <div className="nav-group" key={group.title}>
                            <div className="nav-heading">
                                {group.title}
                            </div>

                            <nav aria-label={group.title}>
                                {group.items.map(item => {
                                    const Icon = item.icon;

                                    return (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            onClick={() => setSidebarOpen(false)}
                                            className={({ isActive }) =>
                                                `nav-link ${isActive ? 'active' : ''}`
                                            }
                                        >
                                            <Icon size={18}/>
                                            <span>{item.label}</span>
                                        </NavLink>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                <div className="sidebar-bottom">
                    <button
                        type="button"
                        className="logout-btn"
                        onClick={() => {
                            setSidebarOpen(false);
                            navigate('/workspaces');
                        }}
                    >
                        <ArrowRightLeft size={18}/>
                        <span>İş mühitini dəyiş</span>
                    </button>

                    <button
                        type="button"
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        <LogOut size={18}/>
                        <span>Hesabdan çıx</span>
                    </button>

                    <div className="muted" style={{ padding: '12px 10px 0' }}>
                        SalesFlow Cloud · v1.0
                    </div>
                </div>
            </aside>

            <div className="main-area">
                <header className="topbar">
                    <div className="top-left">
                        <button
                            type="button"
                            className="mobile-menu icon-btn"
                            aria-label="Menyunu aç"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={22}/>
                        </button>

                        <div className="breadcrumb">
                            <span>İş mühiti</span>
                            <span> / </span>
                            <strong>{workspace?.name || 'SalesFlow'}</strong>
                        </div>
                    </div>

                    <div className="top-right">
                        <label className="workspace-select-label">
                            <Building2 size={17}/>

                            <select
                                aria-label="İş mühitini seç"
                                value={workspace?.tenantId || ''}
                                disabled={switching}
                                onChange={e => void switchWorkspace(e.target.value)}
                            >
                                {!workspace && (
                                    <option value="">İş mühiti seçin</option>
                                )}

                                {workspaces.map(space => (
                                    <option
                                        key={space.tenantId}
                                        value={space.tenantId}
                                    >
                                        {space.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button
                            type="button"
                            className="icon-btn"
                            title="Yeni iş mühiti"
                            aria-label="Yeni iş mühiti"
                            onClick={() => navigate('/workspaces')}
                        >
                            <Plus size={19}/>
                        </button>

                        <button
                            type="button"
                            className="icon-btn"
                            title="Axtarış"
                            aria-label="Axtarış"
                            onClick={handleSearch}
                        >
                            <Search size={19}/>
                        </button>

                        <button
                            type="button"
                            className="icon-btn"
                            title="Bildirişlər"
                            aria-label="Bildirişlər"
                            onClick={handleNotifications}
                        >
                            <Bell size={19}/>
                        </button>

                        <div className="profile-avatar">
                            {initials(user?.displayName || 'U')}
                        </div>

                        <div className="top-profile">
                            <strong>
                                {user?.displayName || 'İstifadəçi'}
                            </strong>

                            <small>
                                {roleLabel(workspace?.role || 'Sales')}
                            </small>
                        </div>
                    </div>
                </header>

                <main className="content">
                    <Outlet/>
                </main>

                <footer className="footer">
                    © 2026 SalesFlow Cloud · Multi-Tenant CRM
                </footer>
            </div>
        </div>
    );
}
