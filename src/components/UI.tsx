
import { LoaderCircle, AlertTriangle, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import type { Paged } from '../api/types';
import type { ReactNode } from 'react';

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
    return <div className="page-heading">
        <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
        {action}
    </div>;
}

export function AddButton({ onClick, label = 'Yeni əlavə et' }: { onClick: () => void; label?: string }) {
    return <button className="btn btn-primary" onClick={onClick}><Plus size={17}/>{label}</button>;
}

export function Panel({ children, title, extra }: { children: ReactNode; title?: string; extra?: ReactNode }) {
    return <section className="panel">
        {(title || extra) && <div className="panel-head">{title && <h2>{title}</h2>}{extra}</div>}
        {children}
    </section>;
}

export function Loading() {
    return <div className="placeholder">
        <LoaderCircle size={25} className="spin"/>
        <p>Məlumatlar yüklənir...</p>
    </div>;
}

export function ErrorBox({ text }: { text: string }) {
    return <div className="error-box">
        <AlertTriangle size={18}/>
        <span>{text}</span>
    </div>;
}

export function Empty({ text = 'Hələ məlumat yoxdur.' }: { text?: string }) {
    return <div className="placeholder">
        <div className="empty-art">◌</div>
        <p>{text}</p>
    </div>;
}

export function Pager<T>({ data, page, setPage }: { data: Paged<T> | null; page: number; setPage: (p: number) => void }) {
    if (!data) return null;
    return <div className="pager">
        <span>{data.totalCount} nəticə • Səhifə {page} / {Math.max(data.totalPages, 1)}</span>
        <div>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Əvvəlki"><ChevronLeft size={16}/></button>
            <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)} aria-label="Növbəti"><ChevronRight size={16}/></button>
        </div>
    </div>;
}

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
    return <div className="overlay" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
        <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
            <div className="modal-head">
                <h2>{title}</h2>
                <button className="icon-btn" aria-label="Bağla" onClick={onClose}><X size={21}/></button>
            </div>
            {children}
        </section>
    </div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
    return <label className="field"><span>{label}</span>{children}</label>;
}

export function Badge({ text }: { text: string | number | null | undefined }) {
    const val = String(text ?? '—');
    const kind = /Won|Paid|Accepted|Completed|Active|Fulfilled|Qualified|Aktiv/i.test(val)
        ? 'success'
        : /Lost|Rejected|Voided|Cancelled|Suspended|Inactive/i.test(val)
            ? 'danger'
            : 'neutral';

    return <span className={`badge badge-${kind}`}>{val}</span>;
}

export function Money({ value, currency = 'AZN' }: { value: number; currency?: string }) {
    return <span className="money">
        {Number(value || 0).toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
    </span>;
}

export function DateText({ value }: { value?: string | null }) {
    if (!value) return <>—</>;
    const d = new Date(value);
    return <>{Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('az-AZ')}</>;
}

export function FormActions({ onCancel, saving }: { onCancel: () => void; saving: boolean }) {
    return <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>İmtina</button>
        <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Yadda saxlanılır...' : 'Yadda saxla'}
        </button>
    </div>;
}

export function Table({ heads, children }: { heads: string[]; children: ReactNode }) {
    return <div className="table-scroll">
        <table>
            <thead><tr>{heads.map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{children}</tbody>
        </table>
    </div>;
}

export function ConfirmAction({ label, onConfirm, danger = false, disabled = false }: { label: string; onConfirm: () => void; danger?: boolean; disabled?: boolean }) {
    return <button
        disabled={disabled}
        className={`btn btn-small ${danger ? 'btn-danger' : 'btn-secondary'}`}
        onClick={() => {
            if (window.confirm(`“${label}” əməliyyatını təsdiqləyirsiniz?`)) onConfirm();
        }}
    >{label}</button>;
}

export function useActionMessage() {
    return undefined;
}
