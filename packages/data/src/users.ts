import type { Inquiry, User } from './types';

/** Fictional users and inquiries for the concept (no real individuals). */
export const users: User[] = [
  { id: 'u-investor-01', displayName: 'سارة (مستثمرة)', role: 'investor', cityId: 'riyadh', verified: true, joinedAt: '2025-02-11', mock: true },
  { id: 'u-investor-02', displayName: 'شركة أفق القابضة', role: 'company', cityId: 'jeddah', verified: true, joinedAt: '2024-11-03', mock: true },
  { id: 'u-investor-03', displayName: 'خالد (مستثمر ملائكي)', role: 'investor', cityId: 'dammam', verified: false, joinedAt: '2026-05-20', mock: true },
  { id: 'u-seller-01', displayName: 'مالك علامة حلويات', role: 'seller', cityId: 'dammam', verified: true, joinedAt: '2025-11-10', mock: true },
  { id: 'u-seller-02', displayName: 'مالك مشروع ورق عنب', role: 'seller', cityId: 'jazan', verified: true, joinedAt: '2025-05-28', mock: true },
  { id: 'u-seller-06', displayName: 'مالك مركز رعاية نهارية', role: 'seller', cityId: 'riyadh', verified: true, joinedAt: '2026-06-01', mock: true },
  { id: 'u-entre-02', displayName: 'فريق دوم', role: 'entrepreneur', cityId: 'riyadh', verified: true, joinedAt: '2026-10-01', mock: true },
  { id: 'u-idea-01', displayName: 'صاحب فكرة فاتورتي', role: 'idea-owner', cityId: 'riyadh', verified: false, joinedAt: '2025-04-10', mock: true },
  { id: 'u-company-01', displayName: 'ديفارما', role: 'company', cityId: 'riyadh', verified: true, joinedAt: '2025-11-30', mock: true },
  { id: 'u-sp-01', displayName: 'مدار التدقيق', role: 'service-provider', cityId: 'riyadh', verified: true, joinedAt: '2026-03-15', mock: true },
];

export const inquiries: Inquiry[] = [
  { id: 'inq-001', opportunityId: 1124, fromUserId: 'u-investor-02', toUserId: 'u-seller-06', message: 'نرغب في الاطلاع على القوائم المالية لآخر سنتين ونسبة الإشغال.', investmentBudgetSar: 1_500_000, status: 'nda-signed', createdAt: '2026-10-02T10:00:00+03:00', updatedAt: '2026-10-04T12:00:00+03:00' },
  { id: 'inq-002', opportunityId: 931, fromUserId: 'u-investor-01', toUserId: 'u-seller-01', message: 'مهتمة بالاستحواذ الكامل، هل يمكن ترتيب زيارة لثلاثة فروع؟', investmentBudgetSar: 8_000_000, status: 'meeting', createdAt: '2026-09-15T09:00:00+03:00', updatedAt: '2026-09-22T16:00:00+03:00' },
  { id: 'inq-003', opportunityId: 1254, fromUserId: 'u-investor-03', toUserId: 'u-entre-02', message: 'ما هي أرقام الجي إم في والمستخدمين النشطين شهريًا؟', investmentBudgetSar: 750_000, status: 'in-discussion', createdAt: '2026-10-15T20:00:00+03:00', updatedAt: '2026-10-16T09:00:00+03:00' },
  { id: 'inq-004', opportunityId: 932, fromUserId: 'u-investor-02', toUserId: 'u-company-01', message: 'نطلب نسخة من عقد التوريد ونموذج التدفقات النقدية.', investmentBudgetSar: 3_500_000, status: 'nda-sent', createdAt: '2026-10-28T11:00:00+03:00', updatedAt: '2026-10-28T11:00:00+03:00' },
  { id: 'inq-005', opportunityId: 704, fromUserId: 'u-investor-01', toUserId: 'u-seller-02', message: 'هل السعر يشمل المصنعين المركزيين والعقارات؟', status: 'new', createdAt: '2026-11-02T18:00:00+03:00', updatedAt: '2026-11-02T18:00:00+03:00' },
  { id: 'inq-006', opportunityId: 672, fromUserId: 'u-investor-03', toUserId: 'u-idea-01', message: 'هل يوجد نموذج أولي أو تصميمات؟', status: 'closed-lost', createdAt: '2026-03-01T10:00:00+03:00', updatedAt: '2026-03-10T10:00:00+03:00' },
];
