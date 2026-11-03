import type { PlatformStats } from './types';

/** From the platform's August 2026 monthly report (تقرير شهر 8 أغسطس 2026). */
export const platformStats: PlatformStats = {
  asOf: '2026-08-31',
  users: 3782,
  opportunities: 1228,
  investmentOpportunities: 285,
  forSaleOpportunities: 389,
  serviceRequests: 65,
  totalValueSar: 2_468_582_530,
  totalViews: 1_443_041,
  consultants: 4,
  commissionPercent: 2.5,
  launchedAt: '2023-06-25',
};

/** Revenue model (from brief + terms page). */
export const revenueStreams = [
  { id: 'commission', ar: 'عمولة 2.5% على قيمة الصفقة', en: '2.5% success commission on deal value' },
  { id: 'listing', ar: 'رسوم الإدراج والتمييز', en: 'Listing and featured-placement fees' },
  { id: 'services', ar: 'هامش الخدمات والاستشارات', en: 'Services & consultation margin' },
  { id: 'sponsorship', ar: 'الرعايات', en: 'Sponsorships' },
] as const;

/** Platform's own public channels (not private individuals). */
export const platformContact = {
  email: 'info@forsh.sa',
  whatsapp: 'https://wa.me/966555341403',
  address: 'الرياض – شركة فرصة وتمكين للتسويق الإلكتروني',
  socials: {
    snapchat: 'https://t.snapchat.com/HLFJrS9g',
    instagram: 'https://instagram.com/forshwtmken',
    linkedin: 'https://linkedin.com/in/forshwtmken',
    youtube: 'https://youtube.com/@forshwtmken',
    x: 'https://twitter.com/forshwtmken',
    tiktok: 'https://www.tiktok.com/@forshwtmken',
  },
  userGuidePdf: 'https://forsh.sa/documents/profile.pdf',
  developer: { name: 'Loopix', url: 'https://loopix.sa/' },
} as const;
