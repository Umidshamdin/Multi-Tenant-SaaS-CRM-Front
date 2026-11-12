
export type Id = string;

export type Paged<T> = {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
};

export type AuthToken = {
    accessToken: string;
    expiresAtUtc: string;
    tenantId: Id | null;
};

export type Profile = {
    userId: string;
    email: string;
    displayName: string;
    activeTenantId: Id | null;
};

export type Workspace = {
    tenantId: Id;
    name: string;
    slug: string;
    role: string;
};

export type Tenant = {
    id: Id;
    name: string;
    slug: string;
    status: string;
    createdAt: string;
};

export type Organization = {
    id: Id;
    tenantId: Id;
    legalName: string;
    countryCode?: string;
    websiteUrl?: string;
};

export type Customer = {
    id: Id;
    tenantId: Id;
    name: string;
    email?: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
};

export type Contact = {
    id: Id;
    tenantId: Id;
    customerId: Id;
    fullName: string;
    email?: string;
    phone?: string;
    createdAt: string;
};

export type Lead = {
    id: Id;
    tenantId: Id;
    fullName: string;
    email?: string;
    companyName?: string;
    status: string;
    convertedCustomerId?: Id;
    createdAt: string;
};

export type Deal = {
    id: Id;
    tenantId: Id;
    customerId: Id;
    title: string;
    amount: number;
    currency: string;
    stage: string;
    closedAt?: string;
    createdAt: string;
};

export type Task = {
    id: Id;
    tenantId: Id;
    title: string;
    assignedMemberId?: Id;
    dueAt?: string;
    status: string;
    completedAt?: string;
};

export type Member = {
    id: Id;
    tenantId: Id;
    identityUserId: string;
    role: string;
    isActive: boolean;
    createdAt: string;
};

export type Activity = {
    id: Id;
    tenantId: Id;
    customerId: Id;
    dealId?: Id;
    kind: string;
    subject: string;
    description?: string;
    occurredAtUtc: string;
    createdAt: string;
};

export type Product = {
    id: Id;
    tenantId: Id;
    sku: string;
    name: string;
    description?: string;
    unitPrice: number;
    currency: string;
    isActive: boolean;
    createdAt: string;
};

export type DealProduct = {
    id: Id;
    dealId: Id;
    productId: Id;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    currency: string;
    netAmount: number;
    taxAmount: number;
    isActive: boolean;
};

export type Quote = {
    id: Id;
    dealId: Id;
    customerId: Id;
    number: string;
    currency: string;
    validUntil: string;
    status: string;
    netAmount: number;
    taxAmount: number;
    totalAmount: number;
};

export type QuoteLine = {
    id: Id;
    quoteId: Id;
    productId: Id;
    description: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    netAmount: number;
    taxAmount: number;
    totalAmount: number;
};

export type SalesOrder = {
    id: Id;
    quoteId: Id;
    customerId: Id;
    number: string;
    totalAmount: number;
    currency: string;
    status: string;
};

export type Invoice = {
    id: Id;
    orderId: Id;
    customerId: Id;
    number: string;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    currency: string;
    status: string;
    dueDate: string;
};

export type Payment = {
    id: Id;
    invoiceId: Id;
    reference: string;
    amount: number;
    recordedAt: string;
};

export type Pipeline = {
    id: Id;
    name: string;
    isActive: boolean;
};

export type PipelineStage = {
    id: Id;
    pipelineId: Id;
    name: string;
    kind: string;
    position: number;
    probabilityPercent: number;
};

export type Note = {
    id: Id;
    recordKind: string;
    recordId: Id;
    body: string;
    authorMemberId: Id;
};

export type Tag = {
    id: Id;
    name: string;
    color?: string;
    tagId?: Id;
};

export type FieldDefinition = {
    id: Id;
    recordKind: string;
    key: string;
    label: string;
    type: string;
};

export type FieldValue = {
    id: Id;
    fieldId: Id;
    recordId: Id;
    value: string;
};

export type Goal = {
    id: Id;
    memberId: Id;
    year: number;
    month: number;
    currency: string;
    targetAmount: number;
};

export type AuditEvent = {
    id: Id;
    action?: string;
    entityType?: string;
    entityId?: Id;
    createdAt?: string;
    details?: string;
    actorMemberId?: Id;
};

export type Dashboard = {
    totalCustomers: number;
    totalLeads: number;
    openTasks: number;
    overdueTasks: number;
    totalDeals: number;
    wonDeals: number;
    lostDeals: number;
    overdueInvoices: number;
    closedWinRatePercent: number;
    byStage: {
        stage: string;
        currency: string;
        count: number;
        amount: number;
    }[];
    byCurrency: {
        currency: string;
        openPipeline: number;
        weightedForecast: number;
        wonRevenue: number;
    }[];
};
