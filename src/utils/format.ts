import type { DealStage, LeadStatus, MemberRole, SalesTaskStatus } from '../api/types';
const leadLabels = ['','Yeni','Əlaqə saxlanılıb','Uyğun','Müştəriyə çevrilib','İtirilib'];
const dealLabels = ['','Axtarış','Qiymətləndirmə','Təklif','Danışıqlar','Qazanılıb','İtirilib'];
const taskLabels = ['','Açıq','Tamamlanıb'];
const roleLabels = ['','Sahib','Administrator','Menecer','Satış əməkdaşı'];
const leadValues = ['','New','Contacted','Qualified','Converted','Lost'];
const dealValues = ['','Prospecting','Qualification','Proposal','Negotiation','Won','Lost'];
const taskValues = ['','Open','Completed'];
const roleValues = ['','Owner','Admin','Manager','Sales'];

export const enumKey = (value: string | number, values: string[]) => typeof value === 'number' ? values[value] || String(value) : value;
export const leadKey = (value: LeadStatus | string) => enumKey(value, leadValues);
export const dealKey = (value: DealStage | string) => enumKey(value, dealValues);
export const taskKey = (value: SalesTaskStatus | string) => enumKey(value, taskValues);
export const roleKey = (value: MemberRole | string) => enumKey(value, roleValues);
export const leadLabel = (value: LeadStatus | string) => leadLabels[leadValues.indexOf(leadKey(value))] || String(value);
export const dealLabel = (value: DealStage | string) => dealLabels[dealValues.indexOf(dealKey(value))] || String(value);
export const taskLabel = (value: SalesTaskStatus | string) => taskLabels[taskValues.indexOf(taskKey(value))] || String(value);
export const roleLabel = (value: MemberRole | string) => roleLabels[roleValues.indexOf(roleKey(value))] || String(value);
export const dateText = (value: string | null | undefined) => value ? new Date(value).toLocaleDateString('az-AZ', { day:'2-digit', month:'short', year:'numeric' }) : '—';
export const dateTimeText = (value: string | null | undefined) => value ? new Date(value).toLocaleString('az-AZ', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
export const money = (amount: number, currency = 'USD') => { try { return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount); } catch { return `${amount.toLocaleString()} ${currency}`; } };
export const shortId = (id: string) => id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
export const initials = (name: string) => name.split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase();
export const toNull = (s: string) => s.trim() || null;
// JSON with an explicit local timezone offset produces DateTimeKind.Local on ASP.NET Core.
// The current backend explicitly rejects UTC/unspecified dates for SalesTask.DueAt.
export function localDateWithOffset(value: string): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return null;
    const pad = (n: number) => String(n).padStart(2, '0');
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00${sign}${pad(Math.floor(Math.abs(offsetMinutes) / 60))}:${pad(Math.abs(offsetMinutes) % 60)}`;
}
export function toDateTimeLocal(value: string | null) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
