
import { http, qs } from './http';

import type {
    AuthToken,
    Profile,
    Workspace,
    Paged,
    Tenant,
    Organization,
    Customer,
    Contact,
    Lead,
    Deal,
    Task,
    Member,
    Activity,
    Product,
    DealProduct,
    Quote,
    QuoteLine,
    SalesOrder,
    Invoice,
    Payment,
    Pipeline,
    PipelineStage,
    Note,
    Tag,
    FieldValue,
    FieldDefinition,
    Goal,
    AuditEvent,
    Dashboard
} from './types';

const page = (n = 1, size = 20) => ({
    page: n,
    pageSize: size
});

export const authApi = {
    login: (email: string, password: string) =>
        http.post<AuthToken>('/auth/login', { email, password }),

    register: (displayName: string, email: string, password: string) =>
        http.post<AuthToken>('/auth/register', { displayName, email, password }),

    me: () => http.get<Profile>('/auth/me'),

    workspaces: () => http.get<Workspace[]>('/auth/workspaces'),

    select: (tenantId: string) =>
        http.post<AuthToken>('/auth/select-tenant', { tenantId }),

    clear: () => http.post<AuthToken>('/auth/clear-tenant')
};

export const tenantApi = {
    create: (payload: {
        name: string;
        slug: string;
        legalName: string;
        countryCode?: string;
        websiteUrl?: string;
    }) => http.post<{
        tenant: Tenant;
        organizationId: string;
        ownerMemberId: string;
    }>('/tenants', payload),

    current: () => http.get<Tenant>('/tenants/current'),

    rename: (name: string) =>
        http.put<Tenant>('/tenants/current/name', { name }),

    organization: () =>
        http.get<Organization>('/tenants/current/organization'),

    updateOrganization: (payload: {
        legalName: string;
        countryCode?: string;
        websiteUrl?: string;
    }) => http.put<Organization>('/tenants/current/organization', payload)
};

export const customerApi = {
    list: (n = 1, search?: string, active?: boolean) =>
        http.get<Paged<Customer>>(`/customers${qs({ ...page(n), search, active })}`),

    create: (payload: {
        name: string;
        email?: string;
        phone?: string;
    }) => http.post<Customer>('/customers', payload),

    update: (id: string, payload: {
        name: string;
        email?: string;
        phone?: string;
    }) => http.put<Customer>(`/customers/${id}`, payload),

    deactivate: (id: string) =>
        http.patch<Customer>(`/customers/${id}/deactivate`)
};

export const contactApi = {
    list: (customerId: string, n = 1) =>
        http.get<Paged<Contact>>(`/contacts${qs({ customerId, ...page(n) })}`),

    create: (payload: {
        customerId: string;
        fullName: string;
        email?: string;
        phone?: string;
    }) => http.post<Contact>('/contacts', payload),

    update: (id: string, payload: {
        fullName: string;
        email?: string;
        phone?: string;
    }) => http.put<Contact>(`/contacts/${id}`, payload)
};

export const leadApi = {
    list: (n = 1, status?: string) =>
        http.get<Paged<Lead>>(`/leads${qs({ ...page(n), status })}`),

    create: (payload: {
        fullName: string;
        email?: string;
        companyName?: string;
    }) => http.post<Lead>('/leads', payload),

    contact: (id: string) =>
        http.patch<Lead>(`/leads/${id}/contact`),

    qualify: (id: string) =>
        http.patch<Lead>(`/leads/${id}/qualify`),

    lost: (id: string) =>
        http.patch<Lead>(`/leads/${id}/lost`),

    convert: (id: string) =>
        http.post<{ lead: Lead; customerId: string }>(`/leads/${id}/convert`)
};

export const dealApi = {
    list: (n = 1, customerId?: string, stage?: string) =>
        http.get<Paged<Deal>>(`/deals${qs({ ...page(n), customerId, stage })}`),

    create: (payload: {
        customerId: string;
        title: string;
        amount: number;
        currency: string;
    }) => http.post<Deal>('/deals', payload),

    title: (id: string, title: string) =>
        http.put<Deal>(`/deals/${id}/title`, { title }),

    amount: (id: string, amount: number) =>
        http.put<Deal>(`/deals/${id}/amount`, { amount }),

    move: (id: string, stage: string) =>
        http.patch<Deal>(`/deals/${id}/stage/${stage}`),

    won: (id: string) =>
        http.patch<Deal>(`/deals/${id}/won`),

    lost: (id: string) =>
        http.patch<Deal>(`/deals/${id}/lost`),

    lines: (id: string, n = 1) =>
        http.get<Paged<DealProduct>>(`/deals/${id}/products${qs(page(n))}`),

    addLine: (id: string, payload: {
        productId: string;
        quantity: number;
        discountPercent: number;
        taxPercent: number;
    }) => http.post<DealProduct>(`/deals/${id}/products`, payload),

    removeLine: (id: string, lineId: string) =>
        http.delete<DealProduct>(`/deals/${id}/products/${lineId}`)
};

export const taskApi = {
    list: (n = 1, status?: string, memberId?: string) =>
        http.get<Paged<Task>>(`/tasks${qs({ ...page(n), status, memberId })}`),

    create: (payload: {
        title: string;
        assignedMemberId?: string | null;
        dueAt?: string | null;
    }) => http.post<Task>('/tasks', payload),

    assign: (id: string, memberId: string) =>
        http.put<Task>(`/tasks/${id}/assign`, { memberId }),

    due: (id: string, dueAt: string | null) =>
        http.put<Task>(`/tasks/${id}/due-date`, { dueAt }),

    complete: (id: string) =>
        http.patch<Task>(`/tasks/${id}/complete`)
};

export const activityApi = {
    list: (n = 1, customerId?: string, dealId?: string, kind?: string) =>
        http.get<Paged<Activity>>(
            `/activities${qs({ ...page(n), customerId, dealId, kind })}`
        ),

    create: (payload: {
        customerId: string;
        dealId?: string | null;
        kind: string;
        subject: string;
        description?: string;
        occurredAtUtc?: string | null;
    }) => http.post<Activity>('/activities', payload)
};

export const memberApi = {
    list: (n = 1, active?: boolean) =>
        http.get<Paged<Member>>(`/members${qs({ ...page(n), active })}`),

    add: (identityUserId: string, role: string) =>
        http.post<Member>('/members', { identityUserId, role }),

    role: (id: string, role: string) =>
        http.put<Member>(`/members/${id}/role`, { role }),

    active: (id: string, active: boolean) =>
        http.put<Member>(`/members/${id}/active`, { active })
};

export const productApi = {
    list: (n = 1, search?: string, active?: boolean) =>
        http.get<Paged<Product>>(`/products${qs({ ...page(n), search, active })}`),

    create: (payload: {
        sku: string;
        name: string;
        description?: string;
        unitPrice: number;
        currency: string;
    }) => http.post<Product>('/products', payload),

    update: (id: string, payload: {
        sku: string;
        name: string;
        description?: string;
        unitPrice: number;
        currency: string;
    }) => http.put<Product>(`/products/${id}`, payload),

    archive: (id: string) =>
        http.patch<Product>(`/products/${id}/archive`)
};

// Bu endpoint-lər Enterprise backend modulları quraşdırılıbsa işləyəcək.
export const enterpriseApi = {
    quotes: (n = 1) =>
        http.get<Paged<Quote>>(`/quotes${qs(page(n))}`),

    quote: (id: string) =>
        http.get<Quote>(`/quotes/${id}`),

    createQuote: (dealId: string, number: string, validUntil: string) =>
        http.post<Quote>('/quotes', { dealId, number, validUntil }),

    quoteLines: (id: string) =>
        http.get<Paged<QuoteLine>>(`/quotes/${id}/lines${qs(page())}`),

    addQuoteLine: (id: string, payload: {
        productId: string;
        quantity: number;
        discountPercent: number;
        taxPercent: number;
    }) => http.post<QuoteLine>(`/quotes/${id}/lines`, payload),

    quoteAction: (id: string, action: 'send' | 'accept' | 'reject') =>
        http.patch<Quote>(`/quotes/${id}/${action}`),

    orders: (n = 1) =>
        http.get<Paged<SalesOrder>>(`/orders${qs(page(n))}`),

    createOrder: (quoteId: string, number: string) =>
        http.post<SalesOrder>('/orders', { quoteId, number }),

    orderAction: (id: string, action: 'fulfill' | 'cancel') =>
        http.patch<SalesOrder>(`/orders/${id}/${action}`),

    invoices: (n = 1) =>
        http.get<Paged<Invoice>>(`/invoices${qs(page(n))}`),

    createInvoice: (orderId: string, number: string, dueDate: string) =>
        http.post<Invoice>('/invoices', { orderId, number, dueDate }),

    invoiceAction: (id: string, action: 'issue' | 'void') =>
        http.patch<Invoice>(`/invoices/${id}/${action}`),

    payments: (invoiceId: string, n = 1) =>
        http.get<Paged<Payment>>(`/invoices/${invoiceId}/payments${qs(page(n))}`),

    pay: (id: string, reference: string, amount: number) =>
        http.post<Payment>(`/invoices/${id}/payments`, { reference, amount }),

    pipelines: (n = 1) =>
        http.get<Paged<Pipeline>>(`/pipelines${qs(page(n))}`),

    createPipeline: (name: string) =>
        http.post<Pipeline>('/pipelines', { name }),

    stages: (id: string, n = 1) =>
        http.get<Paged<PipelineStage>>(`/pipelines/${id}/stages${qs(page(n))}`),

    createStage: (id: string, payload: {
        name: string;
        kind: string;
        position: number;
        probabilityPercent: number;
    }) => http.post<PipelineStage>(`/pipelines/${id}/stages`, payload),

    placeDeal: (dealId: string, pipelineId: string, stageId: string) =>
        http.put<unknown>(`/pipelines/deals/${dealId}`, { pipelineId, stageId }),

    notes: (recordKind: string, recordId: string, n = 1) =>
        http.get<Paged<Note>>(
            `/crm-notes${qs({ recordKind, recordId, ...page(n) })}`
        ),

    createNote: (recordKind: string, recordId: string, body: string) =>
        http.post<Note>('/crm-notes', { recordKind, recordId, body }),

    editNote: (id: string, body: string) =>
        http.put<Note>(`/crm-notes/${id}`, { body }),

    createTag: (name: string, color?: string) =>
        http.post<Tag>('/crm-tags', { name, color }),

    assignTag: (tagId: string, recordKind: string, recordId: string) =>
        http.post<unknown>('/crm-tags/assign', {
            tagId,
            recordKind,
            recordId
        }),

    recordTags: (recordKind: string, recordId: string, n = 1) =>
        http.get<Paged<Tag>>(
            `/crm-tags/records${qs({ recordKind, recordId, ...page(n) })}`
        ),

    defineField: (recordKind: string, key: string, label: string, type: string) =>
        http.post<FieldDefinition>('/custom-fields', {
            recordKind,
            key,
            label,
            type
        }),

    setField: (fieldId: string, recordId: string, value: string) =>
        http.put<FieldValue>('/custom-fields/values', {
            fieldId,
            recordId,
            value
        }),

    fieldValues: (recordKind: string, recordId: string, n = 1) =>
        http.get<Paged<FieldValue>>(
            `/custom-fields/values${qs({ recordKind, recordId, ...page(n) })}`
        ),

    goals: (n = 1) =>
        http.get<Paged<Goal>>(`/sales-goals${qs(page(n))}`),

    createGoal: (payload: {
        memberId: string;
        year: number;
        month: number;
        currency: string;
        targetAmount: number;
    }) => http.post<Goal>('/sales-goals', payload),

    updateGoal: (id: string, targetAmount: number) =>
        http.put<Goal>(`/sales-goals/${id}`, { targetAmount }),

    audit: (n = 1) =>
        http.get<Paged<AuditEvent>>(`/crm-audit${qs(page(n))}`),

    dashboard: () =>
        http.get<Dashboard>('/sales-dashboard')
};
