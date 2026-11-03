import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarClock, Ellipsis, Plus, Search, Sparkles } from 'lucide-react';
import { allPages, customerApi, dealApi } from '../api/salesflow';
import type { Customer, Deal, DealInput, DealStage } from '../api/types';
import { useAction, useWorkspaceKey } from '../hooks/useCrud';
import { Badge, Button, Empty, ErrorNotice, FormField, Loading, Modal, PageHeading, SafeForm } from '../components/UI';
import { dateText, dealKey, dealLabel, initials, money } from '../utils/format';

const stages:DealStage[]=['Prospecting','Qualification','Proposal','Negotiation','Won','Lost'];
const tones=['blue','violet','amber','blue','green','red'] as const;
export function DealsPage() {
    const [creating,setCreating]=useState(false);const[editing,setEditing]=useState<Deal|null>(null);const[search,setSearch]=useState('');
    const [view,setView]=useState<'kanban'|'list'>('kanban');
    const key=useWorkspaceKey('deals'); const dashboard=useWorkspaceKey('dashboard');
    const deals=useQuery({queryKey:key,queryFn:()=>allPages((p,s)=>dealApi.list(p,s))});
    const customers=useQuery({queryKey:useWorkspaceKey('customersAll'),queryFn:()=>allPages((p,s)=>customerApi.list(p,s,undefined,true))});
    const stageAction=useAction(({id,stage}:{id:string;stage:DealStage})=>dealApi.stage(id,stage),[key,dashboard],'Satış mərhələsi dəyişdirildi.');
    const won=useAction((id:string)=>dealApi.won(id),[key,dashboard],'Satış qazanılmış kimi bağlandı.');
    const lost=useAction((id:string)=>dealApi.lost(id),[key,dashboard],'Satış itirilmiş kimi bağlandı.');
    const filtered=deals.data?.items.filter(item=>item.title.toLowerCase().includes(search.toLowerCase())||customers.data?.items.find(x=>x.id===item.customerId)?.name.toLowerCase().includes(search.toLowerCase()))||[];
    function changeStage(item:Deal,stage:DealStage) {
        if(dealKey(item.stage)===dealKey(stage))return;
        const val=dealKey(stage);
        if(val==='Won')won.mutate(item.id);
        else if(val==='Lost')lost.mutate(item.id);
        else stageAction.mutate({id:item.id,stage});
    }
    const busy=stageAction.isPending||won.isPending||lost.isPending;
    return <div className="page-stack"><PageHeading eyebrow="CRM / SALES" title="Satış pipeline-ı" description="Bütün satış imkanlarını mərhələlər üzrə izləyin." action={<Button onClick={()=>setCreating(true)}><Plus size={17}/> Yeni satış</Button>}/>
        <div className="deal-toolbar"><div className="filter-search"><Search size={17}/><input className="global-filter-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Satış və ya müştəri axtar..."/></div><div className="segmented"><button className={view==='kanban'?'selected':''} onClick={()=>setView('kanban')}>Kanban</button><button className={view==='list'?'selected':''} onClick={()=>setView('list')}>Siyahı</button></div><span className="record-count">{filtered.length} satış</span></div>
        {deals.isLoading?<Loading/>:deals.isError?<ErrorNotice message={deals.error?.message}/>:<>
            {deals.data?.truncated&&<div className="info-note">Kanban ilk 2 000 satış üzrə göstərilir.</div>}
            {view==='kanban'?<div className="kanban-board">{stages.map((stage,i)=>{const list=filtered.filter(item=>dealKey(item.stage)===dealKey(stage));return <div className="kanban-column" key={stage} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const id=event.dataTransfer.getData('text/plain');const item=filtered.find(x=>x.id===id);if(item&&!busy)changeStage(item,stage);}}><div className="kanban-header"><span className={`kanban-indicator lane-${i}`}/><strong>{dealLabel(stage)}</strong><span className="kanban-count">{list.length}</span></div><div className="kanban-total">{list.length} satış</div><div className="kanban-items">{list.map(item=><DealCard key={item.id} item={item} customer={customers.data?.items.find(x=>x.id===item.customerId)} onEdit={()=>setEditing(item)} onMove={stage=>changeStage(item,stage)} disabled={busy}/>)}{!list.length&&<div className="kanban-empty">Satış yoxdur</div>}</div></div>})}</div>:<section className="panel table-panel"><div className="table-scroll"><table className="data-table"><thead><tr><th>Satış</th><th>Müştəri</th><th>Məbləğ</th><th>Mərhələ</th><th>Tarix</th><th/></tr></thead><tbody>{filtered.map(item=><tr key={item.id}><td><strong>{item.title}</strong></td><td>{customers.data?.items.find(x=>x.id===item.customerId)?.name||item.customerId.slice(0,8)}</td><td>{money(item.amount,item.currency)}</td><td><Badge tone={tones[stages.findIndex(x=>dealKey(x)===dealKey(item.stage))]||'blue'}>{dealLabel(item.stage)}</Badge></td><td>{dateText(item.createdAt)}</td><td><Button variant="ghost" onClick={()=>setEditing(item)}>Redaktə et</Button></td></tr>)}</tbody></table></div>{!filtered.length&&<Empty title="Satış tapılmadı"/>}</section>}
        </>}
        {creating&&<DealEditor customers={customers.data?.items||[]} onClose={()=>setCreating(false)}/>}
        {editing&&<DealEditor deal={editing} customers={customers.data?.items||[]} onClose={()=>setEditing(null)}/>}
    </div>;
}
function DealCard({item,customer,onEdit,onMove,disabled}:{item:Deal;customer?:Customer;onEdit:()=>void;onMove:(stage:DealStage)=>void;disabled:boolean}) {
    const terminal=['Won','Lost'].includes(dealKey(item.stage));
    return <article className="deal-card" draggable={!disabled&&!terminal} onDragStart={event=>event.dataTransfer.setData('text/plain',item.id)}>
        <div className="deal-card-top"><span className="deal-type"><Sparkles size={13}/> Sales</span><button aria-label="Satışı redaktə et" className="icon-btn" onClick={onEdit}><Ellipsis size={19}/></button></div>
        <h3>{item.title}</h3><div className="deal-company"><span className="deal-company-avatar">{initials(customer?.name||'CRM')}</span>{customer?.name||`Müştəri #${item.customerId.slice(0,8)}`}</div>
        <div className="deal-card-bottom"><strong>{money(item.amount,item.currency)}</strong><small><CalendarClock size={13}/>{dateText(item.createdAt)}</small></div>
        {!terminal&&<select className="deal-move" aria-label="Satış mərhələsini dəyiş" value={dealKey(item.stage)} disabled={disabled} onChange={e=>onMove(e.target.value)}>{stages.map(s=><option key={s} value={s}>{dealLabel(s)}</option>)}</select>}
    </article>;
}
function DealEditor({deal,customers,onClose}:{deal?:Deal;customers:Customer[];onClose:()=>void}) {
    const [customerId,setCustomer]=useState(deal?.customerId||customers[0]?.id||'');const[title,setTitle]=useState(deal?.title||'');const[amount,setAmount]=useState(String(deal?.amount||''));const[currency,setCurrency]=useState(deal?.currency||'USD');
    const key=useWorkspaceKey('deals');const dashboard=useWorkspaceKey('dashboard');
    const create=useAction((data:DealInput)=>dealApi.create(data),[key,dashboard],'Satış yaradıldı.');
    const edit=useAction(async (data:{title:string;amount:number})=>{if(!deal)throw new Error('Satış tapılmadı.');await dealApi.updateTitle(deal.id,data.title);return dealApi.updateAmount(deal.id,data.amount);},[key,dashboard],'Satış yeniləndi.');
    const isClosed=deal&&['Won','Lost'].includes(dealKey(deal.stage));
    return <Modal title={deal?'Satışı redaktə et':'Yeni satış'} subtitle="Satış məlumatlarını daxil edin." onClose={onClose}><SafeForm className="form-stack" onSubmit={()=>{const value=Number(amount);return (deal?edit.mutateAsync({title:title.trim(),amount:value}):create.mutateAsync({customerId,title:title.trim(),amount:value,currency:currency.trim().toUpperCase()})).then(onClose);}}>
        <FormField label="Müştəri" required><select value={customerId} onChange={e=>setCustomer(e.target.value)} disabled={!!deal} required><option value="">Müştəri seçin</option>{customers.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></FormField>
        {!customers.length&&!deal&&<div className="info-note">Əvvəlcə Müştərilər bölməsindən aktiv müştəri yaradın.</div>}
        <FormField label="Satışın adı" required><input required maxLength={200} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Məsələn, İllik SaaS abunəliyi" disabled={!!isClosed}/></FormField>
        <div className="field-grid"><FormField label="Məbləğ" required><input required type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} disabled={!!isClosed}/></FormField><FormField label="Valyuta"><input maxLength={3} value={currency} onChange={e=>setCurrency(e.target.value)} disabled={!!deal}/></FormField></div>
        {isClosed&&<div className="info-note">Bağlanmış satış backend qaydalarına əsasən redaktə edilə bilməz.</div>}
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Bağla</Button><Button loading={create.isPending||edit.isPending} disabled={!!isClosed||(!deal&&!customers.length)}>{deal?'Yenilə':'Satış yarat'} <ArrowRight size={16}/></Button></div>
    </SafeForm></Modal>;
}
