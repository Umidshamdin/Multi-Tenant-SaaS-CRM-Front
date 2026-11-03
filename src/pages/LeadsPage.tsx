import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Check, CircleX, Mail, Plus, UserRound } from 'lucide-react';
import { leadApi } from '../api/salesflow';
import type { Lead, LeadInput } from '../api/types';
import { useAction, useWorkspaceKey } from '../hooks/useCrud';
import { Badge, Button, Empty, ErrorNotice, FormField, Loading, Modal, PageHeading, Pagination, SafeForm } from '../components/UI';
import { dateText, leadKey, leadLabel, toNull } from '../utils/format';

import type { LeadStatus } from '../api/types';
const statuses:LeadStatus[] = ['New','Contacted','Qualified','Converted','Lost'];
function tone(status: string): 'blue'|'amber'|'green'|'red'|'violet' {return ({ New:'blue', Contacted:'amber', Qualified:'violet', Converted:'green', Lost:'red' } as Record<string,'blue'|'amber'|'green'|'red'|'violet'>)[status]||'blue';}
export function LeadsPage() {
    const [page,setPage]=useState(1);const[status,setStatus]=useState<LeadStatus|'all'>('all');const[creating,setCreating]=useState(false);
    const key=useWorkspaceKey('leads');const dashboard=useWorkspaceKey('dashboard');const customerKey=useWorkspaceKey('customers');
    const data=useQuery({queryKey:[...key,page,status],queryFn:()=>leadApi.list(page,20,status==='all'?undefined:status)});
    const contact=useAction((id:string)=>leadApi.contact(id),[key,dashboard]);
    const qualify=useAction((id:string)=>leadApi.qualify(id),[key,dashboard]);
    const lost=useAction((id:string)=>leadApi.lost(id),[key,dashboard]);
    const convert=useAction((id:string)=>leadApi.convert(id),[key,dashboard,customerKey],'Lead müştəriyə çevrildi.');
    const busy=contact.isPending||qualify.isPending||lost.isPending||convert.isPending;
    return <div className="page-stack"><PageHeading eyebrow="CRM / PROSPECTS" title="Potensial müştərilər" description="Yeni satış imkanlarını izləyin və onları real müştərilərə çevirin." action={<Button onClick={()=>setCreating(true)}><Plus size={17}/> Yeni lead</Button>}/>
        <div className="tabs">{(['all',...statuses] as (LeadStatus|'all')[]).map(value=><button key={value} type="button" className={status===value?'tab-active':''} onClick={()=>{setStatus(value);setPage(1);}}>{value==='all'?'Hamısı':leadLabel(value)}</button>)}</div>
        <section className="panel table-panel"><div className="table-tools"><div><h2>Lead siyahısı</h2><p className="muted">Potensial əlaqələri mərhələlərlə idarə edin</p></div><span className="record-count">{data.data?.totalCount||0} qeyd</span></div>
            {data.isLoading?<Loading/>:data.isError?<ErrorNotice message={data.error?.message}/>:data.data?.items.length?<div className="table-scroll"><table className="data-table"><thead><tr><th>Lead</th><th>Şirkət</th><th>Status</th><th>Yaradılıb</th><th>Əməliyyat</th></tr></thead><tbody>{data.data.items.map((item:Lead)=>{const state=leadKey(item.status);return <tr key={item.id}><td><div className="table-person"><span className="person-avatar lead-avatar"><UserRound size={18}/></span><div><strong>{item.fullName}</strong><small>{item.email||'E-poçt yoxdur'}</small></div></div></td><td>{item.companyName||'—'}</td><td><Badge tone={tone(state)}>{leadLabel(item.status)}</Badge></td><td>{dateText(item.createdAt)}</td><td><div className="inline-actions">{state==='New'&&<Button variant="secondary" disabled={busy} onClick={()=>contact.mutate(item.id)}><Mail size={15}/> Əlaqə</Button>}{state==='Contacted'&&<Button variant="secondary" disabled={busy} onClick={()=>qualify.mutate(item.id)}><Check size={15}/> Uyğun</Button>}{state==='Qualified'&&<Button variant="secondary" disabled={busy} onClick={()=>convert.mutate(item.id)}><ArrowRight size={15}/> Müştəriyə çevir</Button>}{!['Converted','Lost'].includes(state)&&<button type="button" className="small-danger-link" disabled={busy} onClick={()=>{if(window.confirm('Lead itirilmiş kimi qeyd edilsin?'))lost.mutate(item.id);}}><CircleX size={15}/> İtirildi</button>}{['Converted','Lost'].includes(state)&&<span className="muted">Tamamlanıb</span>}</div></td></tr>})}</tbody></table></div>:<Empty title="Lead tapılmadı" description="İlk potensial müştərinizi əlavə edin." action={<Button onClick={()=>setCreating(true)}><Plus size={16}/> Lead əlavə et</Button>}/>}
            <Pagination data={data.data} change={setPage}/>
        </section>
        {creating&&<LeadEditor onClose={()=>setCreating(false)}/>}
    </div>;
}
function LeadEditor({onClose}:{onClose:()=>void}) {
    const [fullName,setFullName]=useState('');const[email,setEmail]=useState('');const[companyName,setCompany]=useState('');
    const key=useWorkspaceKey('leads');const dashboard=useWorkspaceKey('dashboard');
    const action=useAction((data:LeadInput)=>leadApi.create(data),[key,dashboard],'Yeni lead əlavə edildi.');
    return <Modal title="Yeni potensial müştəri" subtitle="İlkin satış əlaqəsini sistemə əlavə edin." onClose={onClose}><SafeForm className="form-stack" onSubmit={()=>action.mutateAsync({fullName:fullName.trim(),email:toNull(email),companyName:toNull(companyName)}).then(onClose)}>
        <FormField label="Ad və soyad" required><input required maxLength={160} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Nümunə: John Doe"/></FormField>
        <FormField label="E-poçt"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@company.com"/></FormField>
        <FormField label="Şirkət"><input value={companyName} onChange={e=>setCompany(e.target.value)} placeholder="Şirkətin adı"/></FormField>
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Ləğv et</Button><Button loading={action.isPending}>Əlavə et</Button></div>
    </SafeForm></Modal>;
}
