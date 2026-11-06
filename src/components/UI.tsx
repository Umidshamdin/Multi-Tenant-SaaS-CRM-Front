import type { ButtonHTMLAttributes, FormEvent, ReactNode } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, LoaderCircle, Search, X } from 'lucide-react';
import type { Page } from '../api/types';

export function Button({ children, variant = 'primary', loading, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'|'danger'; loading?: boolean }) {
    return <button {...props} disabled={props.disabled || loading} className={`btn btn-${variant} ${className}`}>
        {loading && <LoaderCircle className="spin" size={16}/>} {children}
    </button>;
}
export function IconButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button {...props} type={props.type || 'button'} className={`icon-btn ${props.className || ''}`}>{children}</button>;
}
export function Modal({ title, children, onClose, subtitle, wide }: { title: string; children: ReactNode; onClose: () => void; subtitle?: string; wide?: boolean }) {
    return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
        <section role="dialog" aria-modal="true" aria-label={title} className={`modal-card ${wide ? 'modal-wide' : ''}`}>
            <header className="modal-header"><div><h2>{title}</h2>{subtitle && <p className="muted">{subtitle}</p>}</div><IconButton aria-label="Bağla" onClick={onClose}><X size={20}/></IconButton></header>
            <div className="modal-body">{children}</div>
        </section>
    </div>;
}
export function FormField({ label, children, hint, required }: { label: string; children: ReactNode; hint?: string; required?: boolean }) {
    return <label className="field"><span className="field-label">{label}{required && <span className="required"> *</span>}</span>{children}{hint && <small className="muted">{hint}</small>}</label>;
}
export function ErrorNotice({ message }: { message?: string | null }) {
    return message ? <div className="error-notice"><AlertCircle size={18}/><span>{message}</span></div> : null;
}
export function Loading({ label = 'Məlumatlar yüklənir...' }: { label?: string }) { return <div className="loading"><LoaderCircle className="spin" size={24}/>{label}</div>; }
export function Empty({ title, description, action }: { title: string; description?: string; action?: ReactNode }) { return <div className="empty-state"><div className="empty-mark"><Search size={23}/></div><h3>{title}</h3>{description && <p>{description}</p>}{action}</div>; }
export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
    return <div className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{description}</p></div>{action && <div className="page-action">{action}</div>}</div>;
}
export function Pagination<T>({ data, change }: { data?: Page<T>; change: (n: number) => void }) {
    if (!data || data.totalPages <= 1) return null;
    return <footer className="pagination"><span>{data.totalCount} nəticə · səhifə {data.page}/{data.totalPages}</span><div className="pager-actions">
        <Button variant="secondary" disabled={data.page <= 1} onClick={() => change(data.page - 1)}><ChevronLeft size={16}/> Əvvəlki</Button>
        <Button variant="secondary" disabled={data.page >= data.totalPages} onClick={() => change(data.page + 1)}>Növbəti <ChevronRight size={16}/></Button>
    </div></footer>;
}
export function Panel({ title, subtitle, children, action }: { title: string; subtitle?: string; children: ReactNode; action?: ReactNode }) {
    return <section className="panel"><div className="panel-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>;
}
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral'|'green'|'blue'|'amber'|'red'|'violet' }) {
    return <span className={`status-pill pill-${tone}`}>{children}</span>;
}
export function BackLink({ onClick, text = 'Geri' }: { onClick: () => void; text?: string }) { return <button className="back-link" onClick={onClick} type="button"><ArrowLeft size={16}/>{text}</button>; }
export function ShortcutLink({ onClick, children }: { onClick: () => void; children: ReactNode }) { return <button className="text-link" onClick={onClick} type="button">{children}<ArrowRight size={15}/></button>; }
export function SafeForm({ onSubmit, children, className = '' }: { onSubmit: () => void | Promise<void>; children: ReactNode; className?: string }) {
    function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); try { void Promise.resolve(onSubmit()).catch(() => {}); } catch { /* useAction already reports API errors */ } }
    return <form className={className} onSubmit={submit}>{children}</form>;
}
