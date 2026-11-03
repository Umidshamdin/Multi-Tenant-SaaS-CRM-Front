import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Mail, MoreHorizontal, Phone, Plus, Search, UserRound } from 'lucide-react';
import { contactApi, customerApi } from '../api/salesflow';
import type { Contact, Customer, CustomerInput } from '../api/types';
import { useAction, useWorkspaceKey } from '../hooks/useCrud';
import { useAuth } from '../contexts/AuthContext';
import { Badge, Button, Empty, ErrorNotice, FormField, IconButton, Loading, Modal, PageHeading, Pagination, SafeForm } from '../components/UI';
import { dateText, initials, roleKey, toNull } from '../utils/format';

export function CustomersPage() {
    const [search, setSearch] = useState(''); const delayed = useDeferredValue(search);
    const [active, setActive] = useState('all'); const [page, setPage] = useState(1);
    const [editing, setEditing] = useState<Customer | 'new' | null>(null);
    const [selected, setSelected] = useState<Customer | null>(null);
    const { workspace } = useAuth();
    const key = useWorkspaceKey('customers'); const contactsKey = useWorkspaceKey('contacts'); const dashboardKey = useWorkspaceKey('dashboard');
    const result = useQuery({ queryKey: [...key,page,delayed,active], queryFn: () => customerApi.list(page,15,delayed,active==='all'?undefined:active==='active') });
    const deactivate = useAction((id:string) => customerApi.deactivate(id), [key,dashboardKey], 'Müştəri deaktiv edildi.');
    const canDeactivate = ['Owner','Admin','Manager'].includes(roleKey(workspace?.role || 'Sales'));
    return <div className="page-stack"><PageHeading eyebrow="CRM / CONTACTS" title="Müştərilər" description="Müştəri bazanızı və əlaqə şəxslərinizi bir yerdən idarə edin." action={<Button onClick={() => setEditing('new')}><Plus size={17}/> Yeni müştəri</Button>}/>
        <section className="panel table-panel"><div className="table-tools"><div className="filter-search"><Search size={18}/><input className="global-filter-input" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Ada görə axtar..."/></div><div className="filter-right"><select value={active} onChange={e=>{setActive(e.target.value);setPage(1);}} aria-label="Aktivlik filtri"><option value="all">Bütün müştərilər</option><option value="active">Aktiv</option><option value="inactive">Deaktiv</option></select><span className="record-count">{result.data?.totalCount ?? 0} müştəri</span></div></div>
            {result.isLoading ? <Loading/> : result.isError ? <ErrorNotice message={result.error?.message}/> : result.data?.items.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Müştəri</th><th>Əlaqə</th><th>Qeydiyyat tarixi</th><th>Status</th><th/></tr></thead><tbody>{result.data.items.map(item => <tr key={item.id} onClick={() => setSelected(item)} className="clickable-row"><td><div className="table-person"><span className="person-avatar company-avatar">{initials(item.name)}</span><div><strong>{item.name}</strong><small>Customer · {item.id.slice(0,8)}</small></div></div></td><td><div className="contact-cell">{item.email || 'E-poçt yoxdur'}<small>{item.phone || 'Telefon yoxdur'}</small></div></td><td>{dateText(item.createdAt)}</td><td><Badge tone={item.isActive?'green':'red'}>{item.isActive?'Aktiv':'Deaktiv'}</Badge></td><td><IconButton aria-label="Müştəri detallarını aç" onClick={event=>{event.stopPropagation();setSelected(item);}}><ChevronRight size={17}/></IconButton></td></tr>)}</tbody></table></div> : <Empty title="Müştəri tapılmadı" description="Filtrləri dəyişin və ya yeni müştəri əlavə edin." action={<Button onClick={() => setEditing('new')}><Plus size={16}/> Müştəri əlavə et</Button>}/>}
            <Pagination data={result.data} change={setPage}/>
        </section>
        {editing && <CustomerEditor key={editing==='new'?'new':editing.id} customer={editing==='new'?null:editing} onClose={() => setEditing(null)} onSaved={()=>{setEditing(null);void result.refetch();}}/>}
        {selected && <CustomerDetails customer={selected} onClose={()=>setSelected(null)} onEdit={()=>{setEditing(selected);setSelected(null);}} onDeact={canDeactivate && selected.isActive?()=>{if (window.confirm('Müştərini deaktiv etmək istəyirsən?')) deactivate.mutate(selected.id,{onSuccess:()=>setSelected(null)});}:undefined} contactsKey={contactsKey}/>}
    </div>;
}
function CustomerEditor({ customer, onClose, onSaved }: { customer: Customer|null; onClose:()=>void; onSaved:()=>void }) {
    const [name,setName]=useState(customer?.name||'');const [email,setEmail]=useState(customer?.email||'');const [phone,setPhone]=useState(customer?.phone||'');
    const key=useWorkspaceKey('customers');const dash=useWorkspaceKey('dashboard');
    const save=useAction((data:CustomerInput)=>customer?customerApi.update(customer.id,data):customerApi.create(data),[key,dash],customer?'Müştəri yeniləndi.':'Müştəri yaradıldı.');
    return <Modal title={customer?'Müştərini redaktə et':'Yeni müştəri'} subtitle="Müştəri məlumatlarını daxil edin." onClose={onClose}><SafeForm onSubmit={()=>save.mutateAsync({name:name.trim(),email:toNull(email),phone:toNull(phone)}).then(onSaved)} className="form-stack">
        <FormField label="Müştəri adı" required><input value={name} onChange={e=>setName(e.target.value)} required maxLength={200} placeholder="Məsələn, Acme Corporation"/></FormField>
        <FormField label="E-poçt"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="contact@company.com"/></FormField>
        <FormField label="Telefon"><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+994 50 123 45 67"/></FormField>
        <div className="modal-actions"><Button variant="secondary" type="button" onClick={onClose}>Ləğv et</Button><Button type="submit" loading={save.isPending}>Yadda saxla</Button></div>
    </SafeForm></Modal>;
}
function CustomerDetails({customer,onClose,onEdit,onDeact,contactsKey}:{customer:Customer;onClose:()=>void;onEdit:()=>void;onDeact?:()=>void;contactsKey:readonly unknown[]}) {
    const [adding,setAdding]=useState(false);
    const result=useQuery({queryKey:[...contactsKey,customer.id],queryFn:()=>contactApi.list(customer.id,1,100)});
    return <Modal title={customer.name} subtitle={`Müştəri profili · ${dateText(customer.createdAt)}`} onClose={onClose} wide>
        <div className="detail-summary"><div className="detail-avatar">{initials(customer.name)}</div><div><strong>{customer.name}</strong><div className="muted">{customer.email || 'E-poçt yoxdur'} · {customer.phone || 'Telefon yoxdur'}</div></div><Badge tone={customer.isActive?'green':'red'}>{customer.isActive?'Aktiv':'Deaktiv'}</Badge></div>
        <div className="detail-buttons"><Button variant="secondary" onClick={onEdit}>Məlumatları dəyiş</Button>{onDeact&&<Button variant="danger" onClick={onDeact}>Deaktiv et</Button>}</div>
        <div className="detail-section-heading"><div><h3>Əlaqə şəxsləri</h3><p>Bu müştəriyə aid kontaktlar</p></div><Button variant="secondary" onClick={()=>setAdding(true)} disabled={!customer.isActive}><Plus size={15}/> Yeni kontakt</Button></div>
        {result.isLoading?<Loading/>:result.isError?<ErrorNotice message={result.error?.message}/>:result.data?.items.length?<div className="contact-cards">{result.data.items.map(contact=><ContactCard key={contact.id} contact={contact} customer={customer}/>)}</div>:<Empty title="Əlaqə şəxsi yoxdur" description="İlk əlaqə şəxsinizi əlavə edin."/>}
        {adding&&<ContactEditor customer={customer} onClose={()=>setAdding(false)}/>}
    </Modal>;
}
function ContactCard({contact,customer}:{contact:Contact;customer:Customer}) {
    const [editing,setEditing]=useState(false);
    return <div className="contact-mini-card"><div className="contact-mini-left"><div className="person-avatar"><UserRound size={18}/></div><div><strong>{contact.fullName}</strong><small><Mail size={13}/>{contact.email||'E-poçt yoxdur'}</small><small><Phone size={13}/>{contact.phone||'Telefon yoxdur'}</small></div></div><IconButton onClick={()=>setEditing(true)} aria-label="Redaktə et"><MoreHorizontal size={18}/></IconButton>{editing&&<ContactEditor customer={customer} contact={contact} onClose={()=>setEditing(false)}/>}</div>;
}
function ContactEditor({customer,contact,onClose}:{customer:Customer;contact?:Contact;onClose:()=>void}) {
    const [fullName,setFullName]=useState(contact?.fullName||''); const[email,setEmail]=useState(contact?.email||''); const[phone,setPhone]=useState(contact?.phone||'');
    const key=useWorkspaceKey('contacts');
    const save=useAction((data:{fullName:string;email:string|null;phone:string|null})=>contact?contactApi.update(contact.id,data):contactApi.create({...data,customerId:customer.id}),[key],contact?'Kontakt yeniləndi.':'Kontakt əlavə edildi.');
    return <Modal title={contact?'Kontaktı redaktə et':'Əlaqə şəxsi əlavə et'} onClose={onClose}><SafeForm onSubmit={()=>save.mutateAsync({fullName:fullName.trim(),email:toNull(email),phone:toNull(phone)}).then(onClose)} className="form-stack">
        <FormField label="Ad və soyad" required><input value={fullName} onChange={e=>setFullName(e.target.value)} required/></FormField><FormField label="E-poçt"><input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></FormField><FormField label="Telefon"><input value={phone} onChange={e=>setPhone(e.target.value)}/></FormField><div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Ləğv et</Button><Button loading={save.isPending}>Yadda saxla</Button></div>
    </SafeForm></Modal>;
}
