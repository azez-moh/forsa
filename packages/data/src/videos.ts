import type { Video, VideoCategory } from './types';

/**
 * Culture & Business Center (https://forsh.sa/culture-center), captured 2026-11-03.
 * Live audience selector: "رائد أعمال" and "رائد أعمال ومستثمر". All visible videos sit under the
 * "تأسيس مشروعك" playlist (203 views total). Counts: first = views, second = likes (unlabelled live).
 */
export const videoCategories: VideoCategory[] = [
  { id: 'founding', name: 'تأسيس مشروعك', audience: 'entrepreneur', description: 'سلسلة لرواد الأعمال من الفكرة إلى الكيان المستدام.' },
  { id: 'investor', name: 'رائد أعمال ومستثمر', audience: 'entrepreneur-investor', description: 'محتوى للمستثمرين وروّاد الأعمال الباحثين عن تمويل (التصنيف ظاهر في الموقع دون فيديوهات مرئية).' },
];

const thumb = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

export const videos: Video[] = [
  { id: 'v1', title: 'خطوات إدارة مشروعك', categoryId: 'founding', youtubeId: '26XI3edsVbk', thumbnail: thumb('26XI3edsVbk'), views: 82, likes: 2 },
  { id: 'v2', title: 'كيف تحمي مشروعك وتضمن استدامته', categoryId: 'founding', youtubeId: 'CKvGRDFStIw', thumbnail: thumb('CKvGRDFStIw'), views: 73, likes: 2 },
  { id: 'v3', title: 'كيف تحول الفكرة إلى كيان استثماري', categoryId: 'founding', youtubeId: 'i2af6b8Ap0w', thumbnail: thumb('i2af6b8Ap0w'), views: 81, likes: 2 },
  { id: 'v4', title: 'إدارة الأزمات وتعديل المسار', categoryId: 'founding', youtubeId: '_udmCRZrowE', thumbnail: thumb('_udmCRZrowE'), views: 42, likes: 2 },
  { id: 'v5', title: 'أنواع التمويل: من أين تبدأ؟', categoryId: 'investor', youtubeId: 'jlO6oqFq28M', thumbnail: thumb('jlO6oqFq28M'), views: 35, likes: 1 },
];

export const youtubeEmbedUrl = (youtubeId: string) => `https://www.youtube.com/embed/${youtubeId}`;
export const platformYoutubeChannel = 'https://youtube.com/@forshwtmken';
