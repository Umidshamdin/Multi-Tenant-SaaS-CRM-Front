import { get, patch, post, put, queryString } from './http';
import type { AuthResponse, Contact, ContactInput, ConvertedLead, Customer, CustomerInput, Deal, DealInput, DealStage, Lead, LeadInput, LeadStatus, Member, MemberRole, Organization, Page, SalesTask, SalesTaskStatus, TaskInput, Tenant, TenantCreated, TenantInput, UserProfile, Workspace } from './types';

export const authApi = {
    login: (email: string, password: string) => post<AuthResponse>('/api/auth/login', { email, password }),
    register: (email: string, password: string, displayName: string) => post<AuthResponse>('/api/auth/register', { email, password, displayName }),
    me: () => get<UserProfile>('/api/auth/me'),
    workspaces: () => get<Workspace[]>('/api/auth/workspaces'),
    selectTenant: (tenantId: string) => post<AuthResponse>('/api/auth/select-tenant', { tenantId }),
    clearTenant: () => post<AuthResponse>('/api/auth/clear-tenant')
};
export const tenantApi = {
    create: (data: TenantInput) => post<TenantCreated>('/api/tenants', data),
    current: () => get<Tenant>('/api/tenants/current'),
    rename: (name: string) => put<Tenant>('/api/tenants/current/name', { name }),
    organization: () => get<Organization>('/api/tenants/current/organization'),
    updateOrganization: (data: { legalName: string; countryCode: string | null; websiteUrl: string | null }) => put<Organization>('/api/tenants/current/organization', data)
};
export const customerApi = {
    list: (page = 1, pageSize = 20, search?: string, active?: boolean) => get<Page<Customer>>(`/api/customers${queryString({ page, pageSize, search, active })}`),
    get: (id: string) => get<Customer>(`/api/customers/${id}`),
    create: (data: CustomerInput) => post<Customer>('/api/customers', data),
    update: (id: string, data: CustomerInput) => put<Customer>(`/api/customers/${id}`, data),
    deactivate: (id: string) => patch<Customer>(`/api/customers/${id}/deactivate`)
};
export const contactApi = {
    list: (customerId: string, page = 1, pageSize = 100) => get<Page<Contact>>(`/api/contacts${queryString({ customerId, page, pageSize })}`),
    create: (data: ContactInput) => post<Contact>('/api/contacts', data),
    update: (id: string, data: Omit<ContactInput, 'customerId'>) => put<Contact>(`/api/contacts/${id}`, data)
};
export const leadApi = {
    list: (page = 1, pageSize = 20, status?: LeadStatus) => get<Page<Lead>>(`/api/leads${queryString({ page, pageSize, status: status ?? undefined })}`),
    create: (data: LeadInput) => post<Lead>('/api/leads', data),
    contact: (id: string) => patch<Lead>(`/api/leads/${id}/contact`),
    qualify: (id: string) => patch<Lead>(`/api/leads/${id}/qualify`),
    lost: (id: string) => patch<Lead>(`/api/leads/${id}/lost`),
    convert: (id: string) => post<ConvertedLead>(`/api/leads/${id}/convert`)
};
export const dealApi = {
    list: (page = 1, pageSize = 20, customerId?: string, stage?: DealStage) => get<Page<Deal>>(`/api/deals${queryString({ page, pageSize, customerId, stage: stage ?? undefined })}`),
    create: (data: DealInput) => post<Deal>('/api/deals', data),
    updateTitle: (id: string, title: string) => put<Deal>(`/api/deals/${id}/title`, { title }),
    updateAmount: (id: string, amount: number) => put<Deal>(`/api/deals/${id}/amount`, { amount }),
    stage: (id: string, stage: DealStage) => patch<Deal>(`/api/deals/${id}/stage/${stage}`),
    won: (id: string) => patch<Deal>(`/api/deals/${id}/won`),
    lost: (id: string) => patch<Deal>(`/api/deals/${id}/lost`)
};
export const taskApi = {
    list: (page = 1, pageSize = 20, status?: SalesTaskStatus, memberId?: string) => get<Page<SalesTask>>(`/api/tasks${queryString({ page, pageSize, status: status ?? undefined, memberId })}`),
    create: (data: TaskInput) => post<SalesTask>('/api/tasks', data),
    assign: (id: string, memberId: string) => put<SalesTask>(`/api/tasks/${id}/assign`, { memberId }),
    dueDate: (id: string, dueAt: string | null) => put<SalesTask>(`/api/tasks/${id}/due-date`, { dueAt }),
    complete: (id: string) => patch<SalesTask>(`/api/tasks/${id}/complete`)
};
export const memberApi = {
    list: (page = 1, pageSize = 20, active?: boolean) => get<Page<Member>>(`/api/members${queryString({ page, pageSize, active })}`),
    add: (identityUserId: string, role: MemberRole) => post<Member>('/api/members', { identityUserId, role }),
    role: (id: string, role: MemberRole) => put<Member>(`/api/members/${id}/role`, { role }),
    active: (id: string, active: boolean) => put<Member>(`/api/members/${id}/active`, { active })
};

// Every dashboard total is calculated from real server responses, never from sample data.
// The maximum is intentional to avoid unbounded browser requests for very large workspaces.
export async function allPages<T>(list: (page: number, pageSize: number) => Promise<Page<T>>, limit = 2000): Promise<{ items: T[]; total: number; truncated: boolean }> {
    const first = await list(1, 100);
    const items = [...first.items];
    let page = 2;
    while (page <= first.totalPages && items.length < limit) {
        const next = await list(page, 100);
        items.push(...next.items);
        page++;
    }
    return { items, total: first.totalCount, truncated: items.length < first.totalCount };
}
