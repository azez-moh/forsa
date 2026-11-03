import type { Category, ServiceCategory } from './types';

/** Opportunity categories as seen on live cards (الفئة). */
export const categories: Category[] = [
  { id: 'commercial', name: { ar: 'تجاري', en: 'Commercial' }, icon: 'store' },
  { id: 'food', name: { ar: 'تغذية', en: 'Food & beverage' }, icon: 'utensils' },
  { id: 'tech', name: { ar: 'تقني', en: 'Technology' }, icon: 'cpu' },
  { id: 'industrial', name: { ar: 'صناعي', en: 'Industrial' }, icon: 'factory' },
  { id: 'services', name: { ar: 'خدمي', en: 'Services' }, icon: 'briefcase' },
  { id: 'medical', name: { ar: 'طبي', en: 'Medical' }, icon: 'stethoscope' },
  { id: 'education', name: { ar: 'تعليمي', en: 'Education' }, icon: 'graduation-cap' },
  { id: 'sports', name: { ar: 'رياضي', en: 'Sports' }, icon: 'dumbbell' },
  { id: 'logistics', name: { ar: 'لوجستي', en: 'Logistics' }, icon: 'truck' },
  { id: 'other', name: { ar: 'أخرى', en: 'Other' }, icon: 'shapes' },
];

/** Service filter tabs on /services. */
export const serviceCategories: ServiceCategory[] = [
  { id: 'legal', name: { ar: 'الخدمات القانونية', en: 'Legal services' } },
  { id: 'business', name: { ar: 'خدمات الأعمال', en: 'Business services' } },
  { id: 'design-marketing', name: { ar: 'خدمات التصميم والتسويق', en: 'Design & marketing' } },
  { id: 'finance-advisory', name: { ar: 'الخدمات المالية والاستشارية', en: 'Financial & advisory' } },
];

export const getCategory = (id: Category['id']) => categories.find((c) => c.id === id);
