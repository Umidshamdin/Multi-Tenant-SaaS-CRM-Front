export type Id = string;
export type TenantStatus = 'Active' | 'Suspended' | number;
export type MemberRole = 'Owner' | 'Admin' | 'Manager' | 'Sales' | number;
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost' | number;
export type DealStage = 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost' | number;
export type SalesTaskStatus = 'Open' | 'Completed' | number;

export interface Page<T> { items: T[]; page: number; pageSize: number; totalCount: number; totalPages: number; }
export interface AuthResponse { accessToken: string; expiresAtUtc: string; tenantId: Id | null; }
export interface UserProfile { userId: string; email: string; displayName: string; activeTenantId: Id | null; }
export interface Workspace { tenantId: Id; name: string; slug: string; role: MemberRole; }
export interface Tenant { id: Id; name: string; slug: string; status: TenantStatus; createdAt: string; }
export interface TenantCreated { tenant: Tenant; organizationId: Id; ownerMemberId: Id; }
export interface Organization { id: Id; tenantId: Id; legalName: string; countryCode: string | null; websiteUrl: string | null; createdAt: string; updatedAt: string | null; }
export interface Customer { id: Id; tenantId: Id; name: string; email: string | null; phone: string | null; isActive: boolean; createdAt: string; updatedAt: string | null; }
export interface Contact { id: Id; tenantId: Id; customerId: Id; fullName: string; email: string | null; phone: string | null; createdAt: string; }
export interface Lead { id: Id; tenantId: Id; fullName: string; email: string | null; companyName: string | null; status: LeadStatus; convertedCustomerId: Id | null; createdAt: string; updatedAt: string | null; }
export interface ConvertedLead { lead: Lead; customerId: Id; }
export interface Deal { id: Id; tenantId: Id; customerId: Id; title: string; amount: number; currency: string; stage: DealStage; closedAt: string | null; createdAt: string; updatedAt: string | null; }
export interface SalesTask { id: Id; tenantId: Id; title: string; assignedMemberId: Id | null; dueAt: string | null; status: SalesTaskStatus; completedAt: string | null; createdAt: string; updatedAt: string | null; }
export interface Member { id: Id; tenantId: Id; identityUserId: string; role: MemberRole; isActive: boolean; createdAt: string; }

export interface CustomerInput { name: string; email: string | null; phone: string | null; }
export interface ContactInput { customerId: Id; fullName: string; email: string | null; phone: string | null; }
export interface LeadInput { fullName: string; email: string | null; companyName: string | null; }
export interface DealInput { customerId: Id; title: string; amount: number; currency: string; }
export interface TaskInput { title: string; assignedMemberId: Id | null; dueAt: string | null; }
export interface TenantInput { name: string; slug: string; legalName: string; countryCode: string | null; websiteUrl: string | null; }
