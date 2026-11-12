
import { useCallback, useEffect, useState } from 'react';
import { BarChart3, ClipboardCheck, RefreshCw, Target, Users } from 'lucide-react';
import { customerApi, leadApi, dealApi, taskApi } from '../api/salesflow';
import type { Deal, Lead } from '../api/types';
import { Badge, Empty, ErrorBox, Loading, Money, PageTitle, Panel, Table } from '../components/UI';

type DashboardData = {
    customers: number | null;
    leads: number | null;
    deals: number | null;
    openTasks: number | null;
    recentDeals: Deal[];
    recentLeads: Lead[];
    unavailable: string[];
};

export function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const results = await Promise.allSettled([
                customerApi.list(1),
                leadApi.list(1),
                dealApi.list(1),
                taskApi.list(1, 'Open')
            ]);

            const customers = results[0].status === 'fulfilled'
                ? results[0].value : null;

            const leads = results[1].status === 'fulfilled'
                ? results[1].value : null;

            const deals = results[2].status === 'fulfilled'
                ? results[2].value : null;

            const tasks = results[3].status === 'fulfilled'
                ? results[3].value : null;

            const unavailable = [
                !customers ? 'Müştərilər' : null,
                !leads ? 'Lead-lər' : null,
                !deals ? 'Satış fürsətləri' : null,
                !tasks ? 'Tapşırıqlar' : null
            ].filter((x): x is string => x !== null);

            if (unavailable.length === 4) {
                setError('Dashboard məlumatları yüklənmədi. Backend bağlantısını və aktiv tenant-ı yoxlayın.');
            }

            setData({
                customers: customers?.totalCount ?? null,
                leads: leads?.totalCount ?? null,
                deals: deals?.totalCount ?? null,
                openTasks: tasks?.totalCount ?? null,
                recentDeals: deals?.items.slice(0, 5) ?? [],
                recentLeads: leads?.items.slice(0, 5) ?? [],
                unavailable
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Dashboard yüklənmədi.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const metrics = [
        { label: 'Müştərilər', value: data?.customers, icon: Users, color: 'blue' },
        { label: 'Potensial müştərilər', value: data?.leads, icon: Target, color: 'violet' },
        { label: 'Satış fürsətləri', value: data?.deals, icon: BarChart3, color: 'green' },
        { label: 'Açıq tapşırıqlar', value: data?.openTasks, icon: ClipboardCheck, color: 'orange' }
    ];

    return (
        <>
            <PageTitle
                title="İdarə paneli"
                description="Satış göstəricilərinin ümumi icmalı"
                action={
                    <button className="btn btn-secondary" onClick={() => void load()} disabled={loading}>
                        <RefreshCw size={16}/>
                        Yenilə
                    </button>
                }
            />

            {error && <ErrorBox text={error}/>}

            {loading ? <Loading/> : data && (
                <>
                    {data.unavailable.length > 0 && (
                        <ErrorBox
                            text={`Bəzi məlumatlar əldə edilmədi: ${data.unavailable.join(', ')}.`}
                        />
                    )}

                    <div className="metrics-grid">
                        {metrics.map(metric => {
                            const Icon = metric.icon;

                            return (
                                <div className="metric-card" key={metric.label}>
                                    <div className="metric-head">
                                        <span>{metric.label}</span>

                                        <div className={`metric-icon ${metric.color}`}>
                                            <Icon size={19}/>
                                        </div>
                                    </div>

                                    <strong>
                                        {metric.value === null || metric.value === undefined
                                            ? '—'
                                            : metric.value.toLocaleString('az-AZ')}
                                    </strong>

                                    <small>CRM məlumatları əsasında</small>
                                </div>
                            );
                        })}
                    </div>

                    <div className="two-col">
                        <Panel title="Son satış fürsətləri">
                            {data.recentDeals.length ? (
                                <Table heads={['Başlıq', 'Məbləğ', 'Status']}>
                                    {data.recentDeals.map(deal => (
                                        <tr key={deal.id}>
                                            <td><strong>{deal.title}</strong></td>
                                            <td>
                                                <Money
                                                    value={deal.amount}
                                                    currency={deal.currency}
                                                />
                                            </td>
                                            <td><Badge text={deal.stage}/></td>
                                        </tr>
                                    ))}
                                </Table>
                            ) : <Empty text="Satış fürsəti tapılmadı."/>}
                        </Panel>

                        <Panel title="Son potensial müştərilər">
                            {data.recentLeads.length ? (
                                <Table heads={['Ad, soyad', 'Şirkət', 'Status']}>
                                    {data.recentLeads.map(lead => (
                                        <tr key={lead.id}>
                                            <td><strong>{lead.fullName}</strong></td>
                                            <td>{lead.companyName || '—'}</td>
                                            <td><Badge text={lead.status}/></td>
                                        </tr>
                                    ))}
                                </Table>
                            ) : <Empty text="Potensial müştəri tapılmadı."/>}
                        </Panel>
                    </div>
                </>
            )}
        </>
    );
}
