import type { Service, ServiceProvider } from './types';

/**
 * Services and providers captured from https://forsh.sa/services and service detail pages
 * (2026-11-03). Prices are as shown on the live site (the live grid has formatting glitches such as
 * "6,0000"; the clean value is used here). Where the live page did not expose a price/provider
 * mapping, the value is a best inference and noted in a comment.
 */
export const serviceProviders: ServiceProvider[] = [
  { id: 'sp-forsa', name: 'فرصة وتمكين', cityId: 'riyadh', certified: true, completedOrders: 4, kind: 'platform' },
  { id: 'sp-jaafari', name: 'شركة محمد خالد الجعفري القانونية', cityId: 'ahsa', certified: true, completedOrders: 0, kind: 'law-firm' },
  { id: 'sp-fatoon', name: 'شركة فتون رجاء عبدالرحمن الزهراني للمحاماة والاستشارات', cityId: 'jeddah', certified: true, completedOrders: 0, kind: 'law-firm' },
  { id: 'sp-hagbani', name: 'تركي عبدالرحمن الحقباني للاستشارات القانونية وأعمال التوثيق', cityId: 'riyadh', certified: true, completedOrders: 0, kind: 'law-firm' },
  { id: 'sp-shorooq', name: 'شركة شروق محسن العتيبي للمحاماة والاستشارات القانونية', cityId: 'riyadh', certified: true, completedOrders: 0, kind: 'law-firm' },
  { id: 'sp-madar', name: 'مدار التدقيق محاسبون ومراجعون قانونيون', cityId: 'riyadh', certified: true, completedOrders: 0, kind: 'audit-firm' },
  { id: 'sp-nizami', name: 'المركز النظامي للدراسات والبحوث', cityId: 'riyadh', certified: true, completedOrders: 0, kind: 'research-center' },
  { id: 'sp-fin-team', name: 'فريق متخصص في التحليل المالي والاستثماري', cityId: 'riyadh', certified: true, completedOrders: 0, kind: 'agency' },
];

const s = (id: number) => `https://forsh.sa/services/${id}`;

export const services: Service[] = [
  // ── Platform-provided (فرصة وتمكين) ──
  { id: 2, title: 'دراسة جدوى', description: 'دراسة جدوى للمشروع يعتمد نطاقها على حجم المشروع ونوع الدراسة المطلوبة.', categoryId: 'business', providerId: 'sp-forsa', priceSar: 4000, duration: 'حسب حجم المشروع ونوع الدراسة', sourceUrl: s(2) },
  { id: 3, title: 'طلب استشارة تجارية', description: 'استشارة تجارية لأصحاب المشاريع والمستثمرين حسب طبيعة الاستشارة.', categoryId: 'finance-advisory', providerId: 'sp-forsa', priceSar: 3000, duration: 'حسب الاستشارة', sourceUrl: s(3) },
  { id: 4, title: 'الإجراءات الإدارية', description: 'إنجاز الإجراءات الإدارية والنظامية للمشروع وتختلف حسب المشروع.', categoryId: 'business', providerId: 'sp-forsa', priceSar: 7000, duration: 'تختلف حسب المشروع', sourceUrl: s(4) },
  { id: 5, title: 'هوية العلامة التجارية', description: 'تصميم هوية بصرية متكاملة للعلامة التجارية حسب حجم المشروع واحتياج العميل.', categoryId: 'design-marketing', providerId: 'sp-forsa', priceSar: 6000, duration: 'حسب حجم المشروع', sourceUrl: s(5) },
  { id: 6, title: 'ملف استثماري', description: 'إعداد ملف استثماري احترافي لعرض المشروع على المستثمرين حسب حجم وتعقيد الخطة الاستراتيجية.', categoryId: 'finance-advisory', providerId: 'sp-forsa', priceSar: 5000, duration: 'حسب حجم وتعقيد الخطة', sourceUrl: s(6) },
  { id: 7, title: 'خدمة تفويض مستشار لدراسة المشروع', description: 'تفويض مستشار مختص لدراسة المشروع وتقييمه.', categoryId: 'finance-advisory', providerId: 'sp-forsa', priceSar: 5000, duration: 'من أسبوع إلى شهر حسب حجم المشروع وتعقيده', sourceUrl: s(7) },
  { id: 9, title: 'خدمة نموذج العمل', description: 'بناء نموذج العمل (Business Model) للمشروع حسب حجمه ومتطلباته.', categoryId: 'business', providerId: 'sp-forsa', priceSar: 2000, duration: 'حسب حجم المشروع', sourceUrl: s(9) },
  { id: 11, title: 'تصميم بوستات', description: 'تصميم منشورات لمنصات التواصل؛ المدة حسب عدد التصاميم ونطاق العمل.', categoryId: 'design-marketing', providerId: 'sp-forsa', priceSar: 100, duration: 'حسب عدد التصاميم', sourceUrl: s(11) },
  { id: 12, title: 'تصميم موشن جرافيك', description: 'تصميم فيديوهات موشن جرافيك تعريفية وتسويقية.', categoryId: 'design-marketing', providerId: 'sp-forsa', priceSar: 2400, duration: 'حسب عدد التصاميم', sourceUrl: s(12) },
  { id: 13, title: 'إدارة حسابات منصات التواصل الاجتماعي', description: 'إدارة حسابات التواصل الاجتماعي؛ التسعير حسب نطاق الخدمة وعدد الحسابات.', categoryId: 'design-marketing', providerId: 'sp-forsa', priceSar: 2600, duration: 'شهري', sourceUrl: s(13) },
  { id: 14, title: 'خدمة تقييم الأفكار الأولية', description: 'تقييم أولي لفكرة المشروع وجدواها قبل البدء.', categoryId: 'finance-advisory', providerId: 'sp-forsa', priceSar: 1300, duration: 'حسب حجم المشروع', sourceUrl: s(14) },
  { id: 15, title: 'الاستشارات القانونية وهيكلة الشركات', description: 'استشارات قانونية وهيكلة الشركات حسب حجم المشروع ونوع الدراسة.', categoryId: 'legal', providerId: 'sp-forsa', priceSar: 650, sourceUrl: s(15) },
  { id: 16, title: 'استراتيجيات التسويق والإطلاق', description: 'خطة تسويق وإطلاق تختلف حسب وضوح المنتج وعدد القنوات وحجم السوق.', categoryId: 'design-marketing', providerId: 'sp-forsa', priceSar: 6500, sourceUrl: s(16) },
  { id: 17, title: 'الاستشارات المالية والاقتصادية المتقدمة', description: 'استشارات مالية واقتصادية حسب نطاق البيانات وعدد السيناريوهات ودرجة التعقيد.', categoryId: 'finance-advisory', providerId: 'sp-forsa', priceSar: 650, sourceUrl: s(17) },
  { id: 18, title: 'تحسين محركات البحث (SEO)', description: 'تحسين ظهور الموقع في محركات البحث حسب حجم المشروع ومتطلباته.', categoryId: 'design-marketing', providerId: 'sp-forsa', priceSar: 2340, sourceUrl: s(18) },
  { id: 19, title: 'الإعلانات الممولة (إدارة شهرية)', description: 'إدارة الحملات الإعلانية الممولة شهريًا وقابلة للتجديد؛ تختلف حسب الميزانية والقنوات والأهداف.', categoryId: 'design-marketing', providerId: 'sp-forsa', priceSar: 1040, duration: 'شهري قابل للتجديد', sourceUrl: s(19) },

  // ── Third-party providers ──
  {
    id: 43, title: 'مسك الدفاتر المحاسبية والإقفال الشهري',
    description: 'اشتراك شهري لمسك الدفاتر المحاسبية، والإقفال خلال 10 أيام عمل بعد اكتمال مستندات الشهر.',
    categoryId: 'finance-advisory', providerId: 'sp-madar', priceSar: 2000, originalPriceSar: 2750,
    duration: 'شهري – إقفال خلال 10 أيام عمل', sourceUrl: s(43),
  },
  {
    id: 47, title: 'دراسة الاستثمار وتحليل العائد والمخاطر المالية',
    description:
      'تقييم الفرص الاستثمارية ماليًا من خلال تحليل حجم الاستثمار والتكاليف والإيرادات المتوقعة، وحساب مؤشرات العائد وفترة الاسترداد. تشمل نموذجًا ماليًا مبسطًا وتحليلًا للسيناريوهات والمخاطر مع توصيات مالية.',
    categoryId: 'finance-advisory', providerId: 'sp-fin-team', priceSar: 3500,
    duration: 'حسب نطاق العمل ومتطلبات الخدمة',
    deliverables: ['تقرير تقييم الفرصة', 'نموذج مالي مبسط', 'حساب العائد على الاستثمار ROI', 'حساب فترة الاسترداد', 'تحليل السيناريوهات المالية', 'مصفوفة مخاطر الاستثمار', 'توصيات لتقليل المخاطر وتحسين العائد'],
    requirements: ['بيانات المشروع أو الأصل', 'مبلغ الاستثمار', 'التكاليف الاستثمارية والتشغيلية المتوقعة', 'الإيرادات المتوقعة', 'البيانات أو الدراسات المتاحة'],
    disclaimer: 'خدمة استشارية غير معتمدة، والنتائج لا تمثل ضمانًا للعائد أو نجاح الاستثمار.',
    sourceUrl: s(47),
  },
  // Prices for 45/46/48 were not exposed on the grid; values below are mock (comparable to #47).
  { id: 48, title: 'مراجعة البنود المالية والتجارية في العقود والاتفاقيات', description: 'مراجعة البنود المالية والتجارية وشروط الدفع والغرامات وتوزيع المخاطر، مع صياغة مقترحة عند الطلب. ليست استشارة قانونية أو مراجعة نظامية معتمدة.', categoryId: 'finance-advisory', providerId: 'sp-fin-team', priceSar: 2500, disclaimer: 'ليست استشارة قانونية معتمدة.', sourceUrl: s(48) },
  { id: 46, title: 'تخطيط الميزانية وإدارة العجز المالي', description: 'إعداد الميزانية (Excel) وتوقعات التدفقات النقدية وتحليل العجز وخطط تحسين السيولة. خدمة استشارية غير معتمدة.', categoryId: 'finance-advisory', providerId: 'sp-fin-team', priceSar: 3000, deliverables: ['ميزانية Excel', 'توقعات التدفق النقدي', 'تحليل العجز', 'خطة تحسين السيولة'], sourceUrl: s(46) },
  { id: 45, title: 'إعداد وتحليل القوائم المالية الدورية والسنوية وفق IFRS', description: 'إعداد قائمة الدخل والمركز المالي والتدفقات النقدية والتغير في حقوق الملكية. لا يمثل تدقيقًا أو مراجعة معتمدة.', categoryId: 'finance-advisory', providerId: 'sp-fin-team', priceSar: 4500, sourceUrl: s(45) },
  { id: 38, title: 'دراسة جدوى شاملة', description: 'دراسة سوقية وفنية ومالية وقانونية لدعم القرار وتقليل المخاطر.', categoryId: 'business', providerId: 'sp-nizami', priceSar: 5000, originalPriceSar: 10000, sourceUrl: s(38) },
  { id: 37, title: 'استشارة قانونية', description: 'استشارة قانونية أساسية للأفراد والمنشآت.', categoryId: 'legal', providerId: 'sp-fatoon', priceSar: 800, originalPriceSar: 1000, duration: 'يومان', sourceUrl: s(37) },
  { id: 36, title: 'الاستشارات القانونية', description: 'استشارة قانونية وكافة الطرق النظامية.', categoryId: 'legal', providerId: 'sp-jaafari', priceSar: 118, originalPriceSar: 150, duration: '2', audience: ['الأفراد'], language: 'العربية', sourceUrl: s(36) },
  { id: 35, title: 'التمثيل القانوني الدائم للكيان', description: 'تمثيل قانوني دائم للمنشأة أمام الجهات.', categoryId: 'legal', providerId: 'sp-jaafari', priceSar: 3699, originalPriceSar: 4000, duration: '5', sourceUrl: s(35) },
  { id: 34, title: 'التمثيل القانوني في الاجتماعات والجهات القضائية', description: 'حضور وتمثيل قانوني في الاجتماعات وأمام الجهات القضائية.', categoryId: 'legal', providerId: 'sp-jaafari', priceSar: 500, originalPriceSar: 700, duration: '5', sourceUrl: s(34) },
  { id: 33, title: 'صياغة ومراجعة العقود', description: 'صياغة العقود ومراجعتها نظاميًا.', categoryId: 'legal', providerId: 'sp-jaafari', priceSar: 2500, originalPriceSar: 5000, duration: '7 أيام عمل', sourceUrl: s(33) },
  // Unlinked legal cards on the grid (provider inferred: المركز النظامي / الحقباني).
  { id: 9001, title: 'خدمات التوثيق: إصدار الوكالات', description: 'إصدار الوكالات عبر موثق معتمد.', categoryId: 'legal', providerId: 'sp-hagbani', priceSar: 600, originalPriceSar: 1000, duration: '30 دقيقة', sourceUrl: 'https://forsh.sa/services/26' },
  { id: 9002, title: 'تأسيس الشركات بموجب ترخيص استثماري', description: 'تأسيس الشركات للمستثمرين بموجب ترخيص استثماري.', categoryId: 'legal', providerId: 'sp-shorooq', priceSar: 5000, originalPriceSar: 10000, duration: 'حسب جدول الجهة', sourceUrl: 'https://forsh.sa/services/29' },
];

export const getService = (id: number) => services.find((x) => x.id === id);
export const getProvider = (id: string) => serviceProviders.find((p) => p.id === id);
