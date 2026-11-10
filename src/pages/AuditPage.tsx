import { useCallback } from 'react';
import { enterpriseApi } from '../api/salesflow';
import { usePaged } from '../hooks/useCrud';
import { DateText, Empty, ErrorBox, Loading, Pager, PageTitle, Panel, Table } from '../components/UI';
export function AuditPage() {
  const loader = useCallback((p: number) => enterpriseApi.audit(p), []); const { data, error, loading, page, setPage } = usePaged(loader);
  return <><PageTitle title="Audit tarixçəsi" description="Enterprise modullarında aparılan əməliyyatlar (Owner / Admin / Manager)"/><Panel>{error && <ErrorBox text={error}/ >}{loading ? <Loading/> : data?.items.length ? <Table heads={['Əməliyyat', 'Obyekt', 'Təsvir', 'Tarix']}>{data.items.map(x => <tr key={x.id}><td><strong>{x.action || '—'}</strong></td><td>{x.entityType || '—'}</td><td>{x.details || '—'}</td><td><DateText value={x.createdAt}/></td></tr>)}</Table> : <Empty/>}<Pager data={data} page={page} setPage={setPage}/></Panel><p className="muted pad">Bu audit modulu yalnız Enterprise genişləndirməsinin əməliyyatlarını qeydə alır.</p></>;
}
