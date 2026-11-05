import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Globe2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { tenantApi } from '../api/salesflow';
import type { Organization } from '../api/types';
import { useAuth } from '../contexts/AuthContext';
import { useAction, useWorkspaceKey } from '../hooks/useCrud';
import { Badge, Button, ErrorNotice, FormField, Loading, PageHeading, SafeForm } from '../components/UI';
import { roleKey, roleLabel, toNull } from '../utils/format';

export function SettingsPage() {
    const {workspace,refreshWorkspaces}=useAuth();const role=roleKey(workspace?.role||'Sales');
    const tenant=useQuery({queryKey:useWorkspaceKey('tenantInfo'),queryFn:tenantApi.current});
    const organization=useQuery({queryKey:useWorkspaceKey('organization'),queryFn:tenantApi.organization});
    const canRename=role==='Owner';const canOrg=role==='Owner'||role==='Admin';
    return <div className="page-stack"><PageHeading eyebrow="WORKSPACE / SETTINGS" title="Parametrlər" description="Şirkət profili və iş mühiti məlumatlarını idarə edin."/>
        <div className="settings-header"><div className="settings-logo"><Building2 size={30}/></div><div><span className="eyebrow">AKTİV İŞ MÜHİTİ</span><h2>{workspace?.name}</h2><p>{workspace?.slug} · {roleLabel(workspace?.role||'Sales')}</p></div><Badge tone="green">Aktiv</Badge></div>
        {tenant.isLoading||organization.isLoading?<Loading/>:tenant.isError||organization.isError?<ErrorNotice message={tenant.error?.message||organization.error?.message}/>:<div className="settings-grid">
            <section className="panel settings-panel"><div className="settings-panel-head"><Building2 size={20}/><div><h2>Şirkət adı</h2><p>İş mühitində göstərilən ad</p></div></div>{tenant.data&&<RenameForm key={tenant.data.name} initialName={tenant.data.name} canEdit={canRename} onSuccess={()=>void refreshWorkspaces()}/>}</section>
            <section className="panel settings-panel"><div className="settings-panel-head"><Globe2 size={20}/><div><h2>Hüquqi məlumatlar</h2><p>Şirkətin hüquqi adı və əlaqə ünvanı</p></div></div>{organization.data&&<OrganizationForm key={organization.data.id} org={organization.data} canEdit={canOrg}/>}</section>
            <section className="panel settings-panel security-panel"><div className="settings-panel-head"><LockKeyhole size={20}/><div><h2>Təhlükəsizlik</h2><p>Tenant məlumatlarının izoliyasiyası</p></div></div><div className="security-explanation"><ShieldCheck size={24}/><p>Hər CRM əməliyyatı seçilmiş tenant kontekstində backend tərəfindən yoxlanılır. Frontend tenant identifikatorunu customer/deal sorğularına özbaşına əlavə etmir.</p></div><p className="muted">Şifrə dəyişmə və refresh-token idarəetməsi üçün backend endpoint-ləri hələ mövcud deyil.</p></section>
        </div>}
    </div>;
}
function RenameForm({initialName,canEdit,onSuccess}:{initialName:string;canEdit:boolean;onSuccess:()=>void}) {
    const [name,setName]=useState(initialName);const tenantKey=useWorkspaceKey('tenantInfo');
    const rename=useAction((value:string)=>tenantApi.rename(value),[tenantKey],'Şirkət adı yeniləndi.');
    return <SafeForm className="form-stack" onSubmit={()=>rename.mutateAsync(name.trim()).then(onSuccess)}><FormField label="Şirkət adı"><input required maxLength={160} value={name} onChange={e=>setName(e.target.value)} disabled={!canEdit}/></FormField><Button disabled={!canEdit||name.trim()===initialName} loading={rename.isPending}>Yadda saxla</Button>{!canEdit&&<p className="muted">Bu sahəni yalnız Owner dəyişə bilər.</p>}</SafeForm>;
}
function OrganizationForm({org,canEdit}:{org:Organization;canEdit:boolean}) {
    const[legalName,setLegalName]=useState(org.legalName);const[countryCode,setCountryCode]=useState(org.countryCode||'');const[websiteUrl,setWebsiteUrl]=useState(org.websiteUrl||'');
    const key=useWorkspaceKey('organization');
    const save=useAction((data:{legalName:string;countryCode:string|null;websiteUrl:string|null})=>tenantApi.updateOrganization(data),[key],'Şirkət profili yeniləndi.');
    return <SafeForm className="form-stack" onSubmit={()=>save.mutateAsync({legalName:legalName.trim(),countryCode:toNull(countryCode),websiteUrl:toNull(websiteUrl)}).then(()=>{})}>
        <FormField label="Hüquqi ad"><input value={legalName} onChange={e=>setLegalName(e.target.value)} required disabled={!canEdit}/></FormField>
        <div className="field-grid"><FormField label="Ölkə kodu"><input maxLength={2} value={countryCode} onChange={e=>setCountryCode(e.target.value.toUpperCase())} disabled={!canEdit}/></FormField><FormField label="Veb-sayt"><input type="url" value={websiteUrl} onChange={e=>setWebsiteUrl(e.target.value)} disabled={!canEdit}/></FormField></div>
        <Button disabled={!canEdit} loading={save.isPending}>Yadda saxla</Button>{!canEdit&&<p className="muted">Bu bölməni Owner və Admin dəyişə bilər.</p>}
    </SafeForm>;
}
