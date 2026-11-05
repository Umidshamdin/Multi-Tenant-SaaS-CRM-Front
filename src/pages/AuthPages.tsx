import type { ReactNode } from 'react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, ArrowUpRight, Building2, Check, Eye, EyeOff, Globe2, Layers3, LockKeyhole, Plus, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ErrorNotice, Button, FormField } from '../components/UI';
import { ApiError } from '../api/http';
import { roleLabel } from '../utils/format';

function AuthShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
    return <div className="auth-layout">
        <div className="auth-visual">
            <div className="brand brand-white"><div className="brand-logo"><Layers3 size={22}/></div><span>salesflow<span className="brand-dot">.</span></span></div>
            <div className="auth-visual-main">
                <div className="auth-kicker"><Sparkles size={15}/> Müasir CRM təcrübəsi</div>
                <h1>Satışlarınız üçün<br/><em>daha aydın yol.</em></h1>
                <p>Şirkətləri, müştəriləri və satış pipeline-ını bir təhlükəsiz platformada idarə edin.</p>
                <div className="auth-preview">
                    <div className="preview-title"><span>Satış pipeline-ı</span><span className="preview-live"><span/> Canlı məlumat</span></div>
                    <div className="mini-kanban">
                        <div><span>Potensial</span><i/><i/></div><div><span>Təklif</span><i/><i/></div><div><span>Qazanıldı</span><i/><i/></div>
                    </div>
                    <div className="preview-bottom"><ShieldCheck size={17}/> Hər şirkətin məlumatı ayrıdır</div>
                </div>
            </div>
            <div className="auth-footer">© 2026 SalesFlow Cloud <span>Multi-tenant SaaS CRM</span></div>
        </div>
        <div className="auth-content"><div className="auth-content-inner"><div className="auth-mobile-brand brand"><div className="brand-logo"><Layers3 size={22}/></div><span>salesflow<span className="brand-dot">.</span></span></div><div className="auth-heading"><div className="auth-small-kicker">SALESFLOW CLOUD</div><h2>{title}</h2><p>{subtitle}</p></div>{children}</div></div>
    </div>;
}
function PasswordInput({ value, onChange }: { value: string; onChange: (next: string) => void }) {
    const [visible, setVisible] = useState(false);
    return <div className="password-wrap"><input autoComplete="current-password" type={visible ? 'text' : 'password'} required minLength={6} value={value} onChange={event => onChange(event.target.value)} placeholder="Parolunuzu daxil edin"/><button type="button" className="password-eye" onClick={() => setVisible(x => !x)} aria-label={visible ? 'Parolu gizlət' : 'Parolu göstər'}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>;
}
export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    async function submit(event: FormEvent) {
        event.preventDefault(); setError(''); setPending(true);
        try { await login(email.trim(), password); navigate('/dashboard', { replace: true }); }
        catch (err) { setError(err instanceof Error ? err.message : 'Giriş mümkün olmadı.'); }
        finally { setPending(false); }
    }
    return <AuthShell title="Yenidən xoş gəlmisiniz" subtitle="İş mühitinizə davam etmək üçün hesabınıza daxil olun.">
        <form className="auth-form" onSubmit={event => void submit(event)}><ErrorNotice message={error}/>
            <FormField label="E-poçt ünvanı" required><input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" required/></FormField>
            <FormField label="Parol" required><PasswordInput value={password} onChange={setPassword}/></FormField>
            <Button className="auth-submit" type="submit" loading={pending}>Hesaba daxil ol <ArrowRight size={17}/></Button>
        </form>
        <p className="auth-switch">Hesabınız yoxdur? <Link to="/register">Qeydiyyatdan keçin</Link></p>
        <div className="auth-help"><LockKeyhole size={15}/> Bağlantı JWT ilə qorunur. API məlumatları layihənizdə saxlanılır.</div>
    </AuthShell>;
}
export function RegisterPage() {
    const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
    const [error, setError] = useState(''); const [pending, setPending] = useState(false);
    const { register } = useAuth(); const navigate = useNavigate();
    async function submit(event: FormEvent) {
        event.preventDefault(); setError(''); setPending(true);
        try { await register(email.trim(), password, name.trim()); navigate('/workspaces', { replace: true }); }
        catch (err) { setError(err instanceof Error ? err.message : 'Qeydiyyat mümkün olmadı.'); }
        finally { setPending(false); }
    }
    return <AuthShell title="Yeni hesab yaradın" subtitle="Komandanızı və müştərilərinizi eyni platformadan idarə edin.">
        <form className="auth-form" onSubmit={event => void submit(event)}><ErrorNotice message={error}/>
            <FormField label="Ad və soyad" required><input autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Adınız və soyadınız" required maxLength={160}/></FormField>
            <FormField label="E-poçt ünvanı" required><input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" required/></FormField>
            <FormField label="Parol" required hint="Güclü parol istifadə edin: böyük/kiçik hərf, rəqəm və xüsusi simvol."><PasswordInput value={password} onChange={setPassword}/></FormField>
            <Button className="auth-submit" type="submit" loading={pending}>Hesab yarat <ArrowRight size={17}/></Button>
        </form><p className="auth-switch">Artıq hesabınız var? <Link to="/login">Daxil olun</Link></p>
    </AuthShell>;
}
export function WorkspacesPage() {
    const { user, workspaces, selectWorkspace, logout } = useAuth();
    const [pending, setPending] = useState<string | null>(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    async function select(id: string) {
        setPending(id); setError('');
        try { await selectWorkspace(id); navigate('/dashboard', { replace: true }); }
        catch (err) { setError(err instanceof Error ? err.message : 'Şirkət seçilə bilmədi.'); }
        finally { setPending(null); }
    }
    return <main className="workspace-screen"><div className="workspace-top"><div className="brand"><div className="brand-logo"><Layers3 size={20}/></div><span>salesflow<span className="brand-dot">.</span></span></div><button className="text-link" onClick={logout}>Çıxış</button></div>
        <div className="workspace-center"><div className="welcome-icon"><Building2 size={26}/></div><div className="eyebrow">İŞ MÜHİTİ SEÇİMİ</div><h1>Salam, {user?.displayName || 'xoş gəlmisiniz'}!</h1><p>Davam etmək üçün şirkət mühitini seçin və ya yenisini yaradın.</p><ErrorNotice message={error}/>
            <div className="workspace-list">{workspaces.map(space => <button className="workspace-card" key={space.tenantId} onClick={() => void select(space.tenantId)} disabled={!!pending}>
                <div className="workspace-avatar">{space.name.slice(0, 2).toUpperCase()}</div><div><strong>{space.name}</strong><small>{space.slug} · {roleLabel(space.role)}</small></div>{pending === space.tenantId ? <span className="muted">Seçilir...</span> : <ArrowUpRight size={19}/>}</button>)}
                <button className="workspace-card workspace-create" onClick={() => navigate('/onboarding')}><div className="workspace-avatar"><Plus size={20}/></div><div><strong>Yeni şirkət yaradın</strong><small>Yeni iş mühiti və idarəetmə paneli</small></div><ArrowRight size={19}/></button>
            </div>
        </div>
    </main>;
}
export function OnboardingPage() {
    const [name, setName] = useState(''); const [slug, setSlug] = useState(''); const [slugEdited, setSlugEdited] = useState(false);
    const [legalName, setLegalName] = useState(''); const [countryCode, setCountryCode] = useState('AZ'); const [websiteUrl, setWebsiteUrl] = useState('');
    const [error, setError] = useState(''); const [pending, setPending] = useState(false);
    const { createWorkspace } = useAuth(); const navigate = useNavigate();
    function updateName(value: string) { setName(value); if (!slugEdited) setSlug(value.toLocaleLowerCase('en-US').normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)); }
    async function submit(event: FormEvent) {
        event.preventDefault(); setPending(true); setError('');
        try { await createWorkspace({ name: name.trim(), slug: slug.trim(), legalName: legalName.trim(), countryCode: countryCode.trim() || null, websiteUrl: websiteUrl.trim() || null }); navigate('/dashboard', { replace: true }); }
        catch (err) { setError(err instanceof ApiError ? err.message : 'Şirkət yaradıla bilmədi.'); }
        finally { setPending(false); }
    }
    return <main className="onboarding-screen"><div className="onboarding-header"><div className="brand"><div className="brand-logo"><Layers3 size={20}/></div><span>salesflow<span className="brand-dot">.</span></span></div><button onClick={() => navigate('/workspaces')} className="text-link">Şirkətlərə qayıt</button></div>
        <div className="onboarding-card"><div className="steps"><span className="step-active"><Check size={14}/> Hesab</span><span className="step-line"/><span className="step-active">2 · Şirkət</span><span className="step-line"/><span>3 · Dashboard</span></div>
            <div className="eyebrow">YENİ İŞ MÜHİTİ</div><h1>Şirkətinizi əlavə edin</h1><p>Şirkətiniz üçün ayrıca və təhlükəsiz CRM mühiti yaradılacaq.</p>
            <form className="auth-form" onSubmit={event => void submit(event)}><ErrorNotice message={error}/>
                <FormField label="Şirkətin adı" required><input value={name} onChange={e => updateName(e.target.value)} maxLength={160} required placeholder="Məsələn, Atlas Digital"/></FormField>
                <FormField label="Unikal qısa ünvan (slug)" required hint="Kiçik latın hərfləri, rəqəmlər və defis istifadə edin."><input value={slug} onChange={e => { setSlugEdited(true); setSlug(e.target.value.toLowerCase()); }} maxLength={60} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required placeholder="atlas-digital"/></FormField>
                <FormField label="Hüquqi ad" required><input value={legalName} onChange={e => setLegalName(e.target.value)} required maxLength={200} placeholder="Atlas Digital MMC"/></FormField>
                <div className="field-grid"><FormField label="Ölkə kodu"><input value={countryCode} onChange={e => setCountryCode(e.target.value.toUpperCase())} maxLength={2} placeholder="AZ"/></FormField><FormField label="Veb-sayt"><input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} type="url" placeholder="https://example.com"/></FormField></div>
                <Button type="submit" loading={pending} className="auth-submit">İş mühitini yarat <ArrowRight size={17}/></Button>
            </form><div className="onboarding-features"><span><ShieldCheck size={16}/> Tenant izoliyasiyası</span><span><Users size={16}/> Komanda rolları</span><span><Globe2 size={16}/> Buluda hazır</span></div>
        </div>
    </main>;
}
