import { useEffect, useState } from 'react';
import { ArrowUpRight, CircleDollarSign, Clock3, FileWarning, Handshake, Target, Users, Wallet } from 'lucide-react';
import { enterpriseApi } from '../api/salesflow';
import type { Dashboard } from '../api/types';
import { errorText } from '../api/http';
import { useAuth } from '../contexts/AuthContext';
import { ErrorBox, Loading, Money, PageTitle, Panel, Table } from '../components/UI';
export function DashboardPage() {
  const { user } = useAuth(); const [data, setData] = useState<Dashboard | null>(null); const [err, setErr] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { let live = true; setLoading(true); enterpriseApi.dashboard().then(x => { if (live) setData(x); }).catch(e => { if (live) setErr(errorText(e)); }).finally(() => { if (live) setLoading(false); }); return () => { live = false; }; }, [user?.activeTenantId]);
  const metrics = data ? [
    { label: 'Müştərilər', value: data.totalCustomers, icon: Users, tone: 'blue' },
    { label: 'Lead-lər', value: data.totalLeads, icon: Target, tone: 'violet' },
    { label: 'Satış fürsətləri', value: data.totalDeals, icon: Handshake, tone: 'cyan' },
    { label: 'Qazanılmış satışlar', value: data.wonDeals, icon: CircleDollarSign, tone: 'green' },
    { label: 'Açıq tapşırıqlar', value: data.openTasks, icon: Clock3, tone: 'orange' },
    { label: 'Gecikmiş hesablar', value: data.overdueInvoices, icon: FileWarning, tone: 'red' }
  ] : [];
  return <><PageTitle title="İdarə paneli" description="Satış göstəricilərinin ümumi icmalı"/>{loading ? <Loading/> : err ? <ErrorBox text={`${err} Dashboard endpoint-i (/api/sales-dashboard) Enterprise backend modulunun quraşdırılmasını tələb edir.`}/> : data && <><div className="metrics-grid">{metrics.map(m => <div className="metric-card" key={m.label}><div className="metric-head"><span>{m.label}</span><span className={`metric-icon ${m.tone}`}><m.icon size={20}/></span></div><strong>{m.value.toLocaleString('az-AZ')}</strong><small><ArrowUpRight size={14}/> Real API məlumatı</small></div>)}</div><div className="summary-row"><Panel title="Satış proqnozu"><div className="summary-line"><span>Qazanma faizi</span><strong>{data.closedWinRatePercent.toFixed(1)}%</strong></div><div className="progress"><div style={{ width: `${Math.min(100, data.closedWinRatePercent)}%` }}/></div><div className="summary-line"><span>Gecikmiş tapşırıqlar</span><strong>{data.overdueTasks}</strong></div></Panel><Panel title="Valyutalar üzrə pipeline"><Table heads={['Valyuta', 'Açıq pipeline', 'Proqnoz', 'Qazanılmış']}>{data.byCurrency.map(x => <tr key={x.currency}><td>{x.currency}</td><td><Money value={x.openPipeline} currency={x.currency}/></td><td><Money value={x.weightedForecast} currency={x.currency}/></td><td><Money value={x.wonRevenue} currency={x.currency}/></td></tr>)}</Table>{!data.byCurrency.length && <p className="muted pad">Hələ satış yoxdur.</p>}</Panel></div><Panel title="Mərhələlər üzrə satışlar"><Table heads={['Mərhələ', 'Valyuta', 'Sayı', 'Məbləğ']}>{data.byStage.map((x, i) => <tr key={i}><td>{x.stage}</td><td>{x.currency}</td><td>{x.count}</td><td><Money value={x.amount} currency={x.currency}/></td></tr>)}</Table>{!data.byStage.length && <div className="placeholder"><Wallet size={26}/><p>Hələ satış məlumatı yoxdur.</p></div>}</Panel></>}</>;
}
