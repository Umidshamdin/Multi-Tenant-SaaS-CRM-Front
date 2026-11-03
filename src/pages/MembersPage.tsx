import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Shield, UserRound } from 'lucide-react';
import { memberApi } from '../api/salesflow';
import type { Member, MemberRole } from '../api/types';
import { useAuth } from '../contexts/AuthContext';
import { useAction, useWorkspaceKey } from '../hooks/useCrud';
import { Badge, Button, Empty, ErrorNotice, FormField, Loading, Modal, PageHeading, Pagination, SafeForm } from '../components/UI';
import { dateText, roleKey, roleLabel, shortId } from '../utils/format';

const availableRoles:MemberRole[]=['Admin','Manager','Sales'];
export function MembersPage() {
    const [page,setPage]=useState(1);const[creating,setCreating]=useState(false);
    const {workspace,user}=useAuth(); const role=roleKey(workspace?.role||'Sales');const canManage=['Owner','Admin'].includes(role);
    const key=useWorkspaceKey('members');const allKey=useWorkspaceKey('membersAll');
    const result=useQuery({queryKey:[...key,page],queryFn:()=>memberApi.list(page,20)});
    const updateRole=useAction(({id,role}:{id:string;role:MemberRole})=>memberApi.role(id,role),[key,allKey],'Rol yeniləndi.');
    const active=useAction(({id,isActive}:{id:string;isActive:boolean})=>memberApi.active(id,isActive),[key,allKey],'Üzvlük statusu yeniləndi.');
    return <div className="page-stack"><PageHeading eyebrow="TEAM / MEMBERS" title="Əməkdaşlar" description="Şirkət üzvləri, rollar və giriş hüquqları." action={canManage&&<Button onClick={()=>setCreating(true)}><Plus size={17}/> Əməkdaş əlavə et</Button>}/>
        <div className="members-note"><Shield size={18}/><span>Rollar serverdə yoxlanılır. Yeni üzv əlavə etmək üçün onun əvvəlcədən qeydiyyatdan keçmiş <strong>Identity User ID</strong> dəyəri tələb olunur; e-poçt dəvəti backend-də hələ yoxdur.</span></div>
        <section className="panel table-panel"><div className="table-tools"><div><h2>Komanda siyahısı</h2><p className="muted">Bütün aktiv və deaktiv üzvlər</p></div><span className="record-count">{result.data?.totalCount||0} üzv</span></div>
            {result.isLoading?<Loading/>:result.isError?<ErrorNotice message={result.error?.message}/>:result.data?.items.length?<div className="table-scroll"><table className="data-table"><thead><tr><th>Üzv</th><th>Rol</th><th>Əlavə olunub</th><th>Status</th><th>İdarəetmə</th></tr></thead><tbody>{result.data.items.map((item:Member)=>{const isOwner=roleKey(item.role)==='Owner';const canEditRow=canManage&&!isOwner&&item.identityUserId!==user?.userId&&!(role==='Admin'&&roleKey(item.role)==='Admin');return <tr key={item.id}><td><div className="table-person"><span className="person-avatar"><UserRound size={18}/></span><div><strong>İstifadəçi · {shortId(item.identityUserId)}</strong><small>Member ID: {shortId(item.id)}</small></div></div></td><td><Badge tone={isOwner?'violet':'blue'}>{roleLabel(item.role)}</Badge></td><td>{dateText(item.createdAt)}</td><td><Badge tone={item.isActive?'green':'red'}>{item.isActive?'Aktiv':'Deaktiv'}</Badge></td><td>{canEditRow?<div className="inline-actions"><select className="small-select" value={roleKey(item.role)} disabled={updateRole.isPending} onChange={event=>updateRole.mutate({id:item.id,role:event.target.value})}>{availableRoles.filter(r=>role==='Owner'||roleKey(r)!=='Admin').map(role=><option key={role} value={role}>{roleLabel(role)}</option>)}</select><Button variant="ghost" disabled={active.isPending} onClick={()=>active.mutate({id:item.id,isActive:!item.isActive})}>{item.isActive?'Deaktiv et':'Aktiv et'}</Button></div>:<span className="muted">—</span>}</td></tr>})}</tbody></table></div>:<Empty title="Əməkdaş tapılmadı" description="Əlavə etdiyiniz üzvlər burada görünəcək."/>}
            <Pagination data={result.data} change={setPage}/></section>
        {creating&&<MemberEditor onClose={()=>setCreating(false)}/>}
    </div>;
}
function MemberEditor({onClose}:{onClose:()=>void}) {
    const[id,setId]=useState('');const[role,setRole]=useState<MemberRole>('Sales');const {workspace}=useAuth();const canGrantAdmin=roleKey(workspace?.role||'Sales')==='Owner';const key=useWorkspaceKey('members');const all=useWorkspaceKey('membersAll');
    const save=useAction((payload:{id:string;role:MemberRole})=>memberApi.add(payload.id,payload.role),[key,all],'İstifadəçi komandaya əlavə edildi.');
    return <Modal title="Əməkdaş əlavə et" subtitle="İstifadəçi artıq qeydiyyatdan keçmiş olmalıdır." onClose={onClose}><SafeForm className="form-stack" onSubmit={()=>save.mutateAsync({id:id.trim(),role}).then(onClose)}><FormField label="Identity User ID" required hint="İstifadəçi öz hesabında /api/auth/me ilə ID-sini görə bilər."><input required value={id} onChange={e=>setId(e.target.value)} placeholder="ASP.NET Identity istifadəçi ID-si"/></FormField><FormField label="Rol"><select value={role} onChange={e=>setRole(e.target.value)}>{availableRoles.filter(x=>canGrantAdmin||roleKey(x)!=='Admin').map(x=><option key={x} value={x}>{roleLabel(x)}</option>)}</select></FormField><div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Ləğv et</Button><Button loading={save.isPending}>Üzv əlavə et</Button></div></SafeForm></Modal>;
}
