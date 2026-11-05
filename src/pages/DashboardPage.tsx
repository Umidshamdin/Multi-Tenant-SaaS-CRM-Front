import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, CheckCheck, CircleDollarSign, ContactRound, Plus, Sparkles, Target, TrendingUp, Users, Wallet } from 'lucide-react';
import { allPages, customerApi, dealApi, leadApi, taskApi } from '../api/salesflow';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspaceKey } from '../hooks/useCrud';
import { Badge, ErrorNotice, Loading, Panel, PageHeading, ShortcutLink } from '../components/UI';
import type { Deal, SalesTask } from '../api/types';
import { dateText, dealKey, dealLabel, leadKey, money, taskKey } from '../utils/format';

const activeStages = ['Prospecting','Qualification','Proposal','Negotiation'];
export function DashboardPage() {
    const { user, workspace } = useAuth();
    const navigate = useNavigate();
    const key = useWorkspaceKey('dashboard');
    const dashboard = useQuery({ queryKey: key, queryFn: async () => {
        const [customers, leads, deals, tasks] = await Promise.all([
            allPages((p,s) => customerApi.list(p,s)), allPages((p,s) => leadApi.list(p,s)),
            allPages((p,s) => dealApi.list(p,s)), allPages((p,s) => taskApi.list(p,s))
        ]);
        return { customers, leads, deals, tasks };
    }});
    const data = dashboard.data;
    const deals = data?.deals.items || [];
    const leads = data?.leads.items || [];
    const tasks = data?.tasks.items || [];
    const pipeline = activeStages.map(stage => ({ stage, count: deals.filter(x => dealKey(x.stage) === stage).length, value: deals.filter(x => dealKey(x.stage) === stage).reduce((sum,x) => sum + x.amount, 0) }));
    const max = Math.max(1, ...pipeline.map(x => x.count));
    const activeDeals = deals.filter(x => activeStages.includes(dealKey(x.stage)));
    const recentDeals = [...deals].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0,5);
    const upcomingTasks = tasks.filter(x => taskKey(x.status) === 'Open').sort((a,b) => (a.dueAt || '9999').localeCompare(b.dueAt || '9999')).slice(0,4);
    const won = deals.filter(x => dealKey(x.stage) === 'Won');
    const truncated = data ? Object.values(data).some(x=>x.truncated) : false;
    return <div className="page-stack">
        <PageHeading eyebrow="KOMANDA İCMALI" title={`Salam, ${user?.displayName?.split(' ')[0] || 'komanda'} 👋`} description={`${workspace?.name} iş mühitində son məlumatlara baxın.`} action={<Link to="/deals" className="btn btn-primary"><Plus size={17}/> Satışlara bax</Link>}/>
        <div className="banner"><div className="banner-glow"/><div className="banner-content"><span className="banner-label"><Sparkles size={14}/> SALESFLOW CLOUD</span><h2>Satışlarınızın bütün mənzərəsi,<br/>bir baxışda.</h2><p>Pipeline, müştərilər və tapşırıqlar — bir yerdə.</p><Link to="/deals" className="banner-link">Pipeline-a keç <ArrowRight size={17}/></Link></div><div className="banner-decoration"><div className="banner-circle big"/><div className="banner-circle small"/><div className="banner-float"><TrendingUp size={19}/><strong>CRM</strong></div></div></div>
        {dashboard.isLoading ? <Loading/> : dashboard.isError ? <ErrorNotice message={dashboard.error?.message || 'Dashboard məlumatları alınmadı.'}/> : data && <>
            {truncated && <div className="info-note">İcmal maksimum 2 000 qeydə əsaslanır. Tam statistika üçün server hesabat endpoint-i növbəti mərhələdə əlavə edilməlidir.</div>}
            <div className="stat-grid">
                <Stat icon={<ContactRound size={21}/>} label="Müştərilər" number={String(data.customers.total)} detail={`${data.customers.items.filter(x=>x.isActive).length}${data.customers.truncated ? '+' : ''} aktiv müştəri`} tint="blue"/>
                <Stat icon={<Target size={21}/>} label="Potensial müştərilər" number={String(data.leads.total)} detail={`${leads.filter(x=>leadKey(x.status)==='Qualified').length} uyğun lead`} tint="purple"/>
                <Stat icon={<BriefcaseBusiness size={21}/>} label="Aktiv satışlar" number={String(activeDeals.length)} detail={`${data.deals.total} ümumi satış`} tint="orange"/>
                <Stat icon={<Wallet size={21}/>} label="Qazanılan satışlar" number={String(won.length)} detail="Won mərhələsindəki satışlar" tint="green"/>
            </div>
            <div className="dashboard-grid">
                <Panel title="Satış pipeline-ı" subtitle="Mərhələlər üzrə aktiv satışların sayı" action={<ShortcutLink onClick={()=>navigate('/deals')}>Hamısına bax</ShortcutLink>}>
                    <div className="pipeline-chart">{pipeline.map((item,i) => <div className="pipeline-row" key={item.stage}><div className="pipeline-name"><span className={`pipeline-dot dot-${i}`}/>{dealLabel(item.stage)}</div><div className="pipeline-track"><div className={`pipeline-fill fill-${i}`} style={{width:`${item.count === 0 ? 0 : Math.max(7, item.count/max*100)}%`}}/></div><strong>{item.count}</strong></div>)}</div>
                    <div className="panel-bottom-summary"><div><CircleDollarSign size={17}/><span>Aktiv pipeline</span></div><strong>{activeDeals.length} satış</strong></div>
                </Panel>
                <Panel title="Lead vəziyyəti" subtitle="Potensial müştərilərin cari bölgüsü" action={<ShortcutLink onClick={()=>navigate('/leads')}>Leads</ShortcutLink>}>
                    <div className="lead-metric"><div><strong>{leads.length}</strong><span>potensial müştəri</span></div><div className="lead-graphic"><svg viewBox="0 0 120 120" role="img" aria-label="Lead status payları"><circle cx="60" cy="60" r="42" fill="none" stroke="#f0f2f8" strokeWidth="16"/>{leads.length > 0 && <circle cx="60" cy="60" r="42" fill="none" stroke="#7b5ff4" strokeWidth="16" strokeDasharray={`${(leads.filter(x=>leadKey(x.status)==='Qualified'||leadKey(x.status)==='Converted').length/leads.length)*264} 264`} transform="rotate(-90 60 60)" strokeLinecap="round"/>}</svg><span>{leads.length ? Math.round(leads.filter(x=>leadKey(x.status)==='Qualified'||leadKey(x.status)==='Converted').length/leads.length*100) : 0}%</span></div></div>
                    <div className="legend-row"><span><i className="legend-mark"/> Uyğun və çevrilmiş</span><strong>{leads.filter(x=>['Qualified','Converted'].includes(leadKey(x.status))).length}</strong></div>
                    <div className="legend-row"><span><i className="legend-mark legend-grey"/> Digər statuslar</span><strong>{leads.filter(x=>!['Qualified','Converted'].includes(leadKey(x.status))).length}</strong></div>
                </Panel>
            </div>
            <div className="dashboard-grid">
                <Panel title="Son satışlar" subtitle="Bu iş mühitində son yaradılan satışlar" action={<ShortcutLink onClick={()=>navigate('/deals')}>Bütün satışlar</ShortcutLink>}>
                    {recentDeals.length ? <div className="list-row-stack">{recentDeals.map((deal:Deal) => <div className="activity-row" key={deal.id}><div className="activity-avatar"><BriefcaseBusiness size={17}/></div><div className="activity-main"><strong>{deal.title}</strong><small>{dateText(deal.createdAt)} · {dealLabel(deal.stage)}</small></div><strong>{money(deal.amount,deal.currency)}</strong></div>)}</div> : <div className="simple-empty">Hələ satış yaradılmayıb.</div>}
                </Panel>
                <Panel title="Açıq tapşırıqlar" subtitle="Tamamlanmağı gözləyən işlər" action={<ShortcutLink onClick={()=>navigate('/tasks')}>Bütün tapşırıqlar</ShortcutLink>}>
                    {upcomingTasks.length ? <div className="list-row-stack">{upcomingTasks.map((task:SalesTask) => <div className="activity-row" key={task.id}><div className="activity-avatar task-avatar"><CheckCheck size={17}/></div><div className="activity-main"><strong>{task.title}</strong><small>{task.dueAt ? `Son tarix: ${dateText(task.dueAt)}` : 'Son tarix təyin edilməyib'}</small></div><Badge tone="amber">Açıq</Badge></div>)}</div> : <div className="simple-empty">Açıq tapşırıq yoxdur.</div>}
                </Panel>
            </div>
            <section className="quick-actions"><div><h2>Sürətli keçidlər</h2><p>Gündəlik istifadə olunan modullar</p></div><div className="quick-action-links"><Link to="/customers"><span className="quick-icon"><Users size={19}/></span>Müştərilər <ArrowUpRight size={16}/></Link><Link to="/leads"><span className="quick-icon"><Target size={19}/></span>Leads <ArrowUpRight size={16}/></Link><Link to="/tasks"><span className="quick-icon"><CheckCheck size={19}/></span>Tapşırıqlar <ArrowUpRight size={16}/></Link></div></section>
        </>}
    </div>;
}
function Stat({ icon, label, number, detail, tint }: { icon: ReactNode; label:string; number:string; detail:string; tint:string }) {
    return <section className="stat-card"><div className="stat-top"><span className={`stat-icon stat-${tint}`}>{icon}</span><ArrowUpRight size={17} className="stat-corner"/></div><div className="stat-number">{number}</div><div className="stat-label">{label}</div><p className="stat-detail">{detail}</p></section>;
}
