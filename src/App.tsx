import { NavLink, Navigate, Route, Routes } from 'react-router';
import { LayoutDashboard, Users, Target, Handshake, ListTodo, Settings, Layers3 } from 'lucide-react';

const navigation = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/leads', label: 'Leads', icon: Target },
  { path: '/deals', label: 'Deals', icon: Handshake },
  { path: '/tasks', label: 'Tasks', icon: ListTodo },
  { path: '/settings', label: 'Settings', icon: Settings }
];

function Page({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-500">SalesFlow Cloud CRM</p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-semibold">{title} module</h2>
        <p className="mt-2 text-sm text-slate-500">
          This module will be connected to the SalesFlow API.
        </p>
      </div>
    </div>
  );
}

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="w-full bg-slate-950 text-white md:min-h-screen md:w-64 md:shrink-0">
        <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-6">
          <div className="rounded-xl bg-blue-600 p-2">
            <Layers3 size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold">SalesFlow</h2>
            <p className="text-xs text-slate-400">Cloud CRM</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto p-3 md:mt-5 md:flex-col">
          {navigation.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6">
          <span className="text-sm font-medium text-slate-500">Workspace / SalesFlow</span>
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            Development
          </span>
        </header>

        <div className="p-6 md:p-10">
          <Routes>
            <Route index element={<Page title="Dashboard" />} />
            <Route path="customers" element={<Page title="Customers" />} />
            <Route path="leads" element={<Page title="Leads" />} />
            <Route path="deals" element={<Page title="Sales Pipeline" />} />
            <Route path="tasks" element={<Page title="Tasks" />} />
            <Route path="settings" element={<Page title="Settings" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <DashboardLayout />;
}
