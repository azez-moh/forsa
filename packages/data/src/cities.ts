import type { City } from './types';

/** The 17 cities offered by the live city filter, in the live order. */
export const cities: City[] = [
  { id: 'riyadh', name: { ar: 'الرياض', en: 'Riyadh' }, region: { ar: 'منطقة الرياض', en: 'Riyadh Region' }, lat: 24.7136, lng: 46.6753 },
  { id: 'jeddah', name: { ar: 'جدة', en: 'Jeddah' }, region: { ar: 'منطقة مكة المكرمة', en: 'Makkah Region' }, lat: 21.4858, lng: 39.1925 },
  { id: 'makkah', name: { ar: 'مكة المكرمة', en: 'Makkah' }, region: { ar: 'منطقة مكة المكرمة', en: 'Makkah Region' }, lat: 21.3891, lng: 39.8579 },
  { id: 'dammam', name: { ar: 'الدمام', en: 'Dammam' }, region: { ar: 'المنطقة الشرقية', en: 'Eastern Province' }, lat: 26.4207, lng: 50.0888 },
  { id: 'madinah', name: { ar: 'المدينة المنورة', en: 'Madinah' }, region: { ar: 'منطقة المدينة المنورة', en: 'Madinah Region' }, lat: 24.5247, lng: 39.5692 },
  { id: 'qassim', name: { ar: 'القصيم', en: 'Qassim' }, region: { ar: 'منطقة القصيم', en: 'Qassim Region' }, lat: 26.3260, lng: 43.9750 },
  { id: 'abha', name: { ar: 'أبها', en: 'Abha' }, region: { ar: 'منطقة عسير', en: 'Asir Region' }, lat: 18.2164, lng: 42.5053 },
  { id: 'tabuk', name: { ar: 'تبوك', en: 'Tabuk' }, region: { ar: 'منطقة تبوك', en: 'Tabuk Region' }, lat: 28.3838, lng: 36.5550 },
  { id: 'hail', name: { ar: 'حائل', en: "Ha'il" }, region: { ar: 'منطقة حائل', en: "Ha'il Region" }, lat: 27.5114, lng: 41.7208 },
  { id: 'arar', name: { ar: 'عرعر', en: 'Arar' }, region: { ar: 'منطقة الحدود الشمالية', en: 'Northern Borders' }, lat: 30.9753, lng: 41.0381 },
  { id: 'jazan', name: { ar: 'جازان', en: 'Jazan' }, region: { ar: 'منطقة جازان', en: 'Jazan Region' }, lat: 16.8892, lng: 42.5511 },
  { id: 'najran', name: { ar: 'نجران', en: 'Najran' }, region: { ar: 'منطقة نجران', en: 'Najran Region' }, lat: 17.5656, lng: 44.2289 },
  { id: 'sakaka', name: { ar: 'سكاكا', en: 'Sakaka' }, region: { ar: 'منطقة الجوف', en: 'Al Jouf Region' }, lat: 29.9697, lng: 40.2064 },
  { id: 'albaha', name: { ar: 'الباحة', en: 'Al Baha' }, region: { ar: 'منطقة الباحة', en: 'Al Baha Region' }, lat: 20.0129, lng: 41.4677 },
  { id: 'taif', name: { ar: 'الطائف', en: 'Taif' }, region: { ar: 'منطقة مكة المكرمة', en: 'Makkah Region' }, lat: 21.2703, lng: 40.4158 },
  { id: 'khobar', name: { ar: 'الخبر', en: 'Al Khobar' }, region: { ar: 'المنطقة الشرقية', en: 'Eastern Province' }, lat: 26.2172, lng: 50.1971 },
  { id: 'ahsa', name: { ar: 'الأحساء', en: 'Al Ahsa' }, region: { ar: 'المنطقة الشرقية', en: 'Eastern Province' }, lat: 25.3836, lng: 49.5865 },
];

export const getCity = (id: City['id']) => cities.find((c) => c.id === id);
