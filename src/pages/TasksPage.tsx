import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, Check, CheckCircle2, Circle, Plus, UserRound } from 'lucide-react';
import { memberApi, taskApi } from '../api/salesflow';
import type { Member, SalesTask, TaskInput, SalesTaskStatus } from '../api/types';
import { useAction, useWorkspaceKey } from '../hooks/useCrud';
import { useAuth } from '../contexts/AuthContext';
import { Badge, Button, Empty, ErrorNotice, FormField, Loading, Modal, PageHeading, Pagination, SafeForm } from '../components/UI';
import { dateText, localDateWithOffset, roleKey, shortId, taskKey, toDateTimeLocal } from '../utils/format';

export function TasksPage() {
    const [page,setPage]=useState(1);const[filter,setFilter]=useState<SalesTaskStatus|'all'>('all');const[creating,setCreating]=useState(false);
    const [editing,setEditing]=useState<SalesTask|null>(null);
    const {workspace}=useAuth(); const canAssign=['Owner','Admin','Manager'].includes(roleKey(workspace?.role||'Sales'));
    const key=useWorkspaceKey('tasks');const dashboard=useWorkspaceKey('dashboard');
    const members=useQuery({queryKey:useWorkspaceKey('membersAll'),queryFn:()=>memberApi.list(1,100,true)});
    const tasks=useQuery({queryKey:[...key,page,filter],queryFn:()=>taskApi.list(page,20,filter==='all'?undefined:filter)});
    const complete=useAction((id:string)=>taskApi.complete(id),[key,dashboard],'Tapşırıq tamamlandı.');
    const memberName=(id:string|null)=>id?`Üzv · ${shortId(id)}`:'Təyin edilməyib';
    return <div className="page-stack"><PageHeading eyebrow="WORKSPACE / TASKS" title="Tapşırıqlar" description="Tapşırıqları planlaşdırın, təyin edin və icrasını izləyin." action={<Button onClick={()=>setCreating(true)}><Plus size={17}/> Yeni tapşırıq</Button>}/>
        <div className="tabs">{([['all','Hamısı'],['Open','Açıq'],['Completed','Tamamlanmış']] as [SalesTaskStatus|'all', string][]).map(([val,label])=><button key={val} className={filter===val?'tab-active':''} onClick={()=>{setFilter(val);setPage(1);}}>{label}</button>)}</div>
        <section className="panel table-panel"><div className="table-tools"><div><h2>Komanda tapşırıqları</h2><p className="muted">Tapşırıqların statusu və icra müddəti</p></div><span className="record-count">{tasks.data?.totalCount||0} tapşırıq</span></div>
        {tasks.isLoading?<Loading/>:tasks.isError?<ErrorNotice message={tasks.error?.message}/>:tasks.data?.items.length?<div className="task-list">{tasks.data.items.map(item=><div className="task-row" key={item.id}><div className={`task-check ${taskKey(item.status)==='Completed'?'completed':''}`}>{taskKey(item.status)==='Completed'?<Check size={17}/>:<Circle size={18}/>}</div><div className="task-primary"><strong className={taskKey(item.status)==='Completed'?'done-text':''}>{item.title}</strong><span><CalendarClock size={14}/>{item.dueAt?dateText(item.dueAt):'Son tarix yoxdur'}<span className="task-sep">·</span><UserRound size={14}/>{memberName(item.assignedMemberId)}</span></div><Badge tone={taskKey(item.status)==='Completed'?'green':'amber'}>{taskKey(item.status)==='Completed'?'Tamamlanıb':'Açıq'}</Badge><div className="task-buttons">{taskKey(item.status)==='Open'&&<><Button variant="ghost" onClick={()=>setEditing(item)}>Düzəliş</Button><Button variant="secondary" disabled={complete.isPending} onClick={()=>complete.mutate(item.id)}><CheckCircle2 size={15}/> Tamamla</Button></>}</div></div>)}</div>:<Empty title="Tapşırıq yoxdur" description="İlk tapşırığınızı yaradın." action={<Button onClick={()=>setCreating(true)}><Plus size={16}/> Əlavə et</Button>}/>}
        <Pagination data={tasks.data} change={setPage}/></section>
        {creating&&<TaskEditor members={members.data?.items||[]} canAssign={canAssign} onClose={()=>setCreating(false)}/>}
        {editing&&<TaskEditor task={editing} members={members.data?.items||[]} canAssign={canAssign} onClose={()=>setEditing(null)}/>}
    </div>;
}
function TaskEditor({task,members,canAssign,onClose}:{task?:SalesTask;members:Member[];canAssign:boolean;onClose:()=>void}) {
    const [title,setTitle]=useState(task?.title||'');const[memberId,setMemberId]=useState(task?.assignedMemberId||'');const[dueAt,setDueAt]=useState(toDateTimeLocal(task?.dueAt||null));
    const key=useWorkspaceKey('tasks');const dashboard=useWorkspaceKey('dashboard');
    const create=useAction((data:TaskInput)=>taskApi.create(data),[key,dashboard],'Tapşırıq yaradıldı.');
    const save=useAction(async()=>{if(!task)throw new Error('Tapşırıq yoxdur.');if(canAssign&&memberId&&memberId!==task.assignedMemberId)await taskApi.assign(task.id,memberId);return taskApi.dueDate(task.id,localDateWithOffset(dueAt));},[key,dashboard],'Tapşırıq yeniləndi.');
    return <Modal title={task?'Tapşırığı redaktə et':'Yeni tapşırıq'} subtitle={task?'Tarixi və təyinatı dəyişə bilərsən. Tapşırıq adı backend-də yenilənmir.':'Komanda üçün yeni iş yaradın.'} onClose={onClose}><SafeForm className="form-stack" onSubmit={()=>task?save.mutateAsync(undefined).then(onClose):create.mutateAsync({title:title.trim(),assignedMemberId:memberId||null,dueAt:localDateWithOffset(dueAt)}).then(onClose)}>
        <FormField label="Başlıq" required><input required value={title} onChange={e=>setTitle(e.target.value)} maxLength={200} disabled={!!task} placeholder="Məsələn, Təklif sənədini göndər"/></FormField>
        <FormField label="İcraçı"><select value={memberId} onChange={e=>setMemberId(e.target.value)} disabled={!!task&&!canAssign}><option value="">Təyin edilməyib</option>{members.map(member=><option key={member.id} value={member.id}>{roleKey(member.role)} · {shortId(member.identityUserId)}</option>)}</select></FormField>
        <FormField label="Son tarix" hint="Tarix serverə lokal timezone offset-i ilə göndərilir."><input type="datetime-local" value={dueAt} onChange={e=>setDueAt(e.target.value)}/></FormField>
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Ləğv et</Button><Button loading={create.isPending||save.isPending}>Yadda saxla</Button></div>
    </SafeForm></Modal>;
}
