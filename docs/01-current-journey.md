# 01 — Current Journey Audit: forsh.sa (فرصة وتمكين)

Captured 2026-11-03 from public pages only, read through WebFetch. We did not log in, register or submit any form. The front end is Next.js. Images and data come from `api.forsh.sa/storage/*`. The site was built by Loopix.

> Caveat: WebFetch returns a text rendering of the page. Hover states, modals and client-only widgets (for example the filter checkbox labels for type and category, and the FAQ accordion bodies) may exist in the browser but did not appear in the capture. Each such case is marked *(not rendered)* below.

---

## 1. Site map

| URL | What's on it |
|---|---|
| `/` | Hero "فرصتك على بعد خطوة" with 3 CTAs: **إضافة فرصة** (→ `/profile/new-opportunity`), **طلب استشارة** (→ `/consultants`), **طلب خدمة** (→ `/services`). Services carousel (10 cards). Latest articles (3). Culture-center "تأسيس مشروعك" video strip (5). Featured opportunities (4: #1124, #932, #931, #704). Footer. **No platform stats on the home page**, even though the August report has strong numbers. |
| `/opportunities` | Listing of all types, 10 per page, **45 pages** (~450 live listings). Filter sidebar and sort. "إضافة جديدة" button. |
| `/opportunities?type=1` | للبيع: 20 pages |
| `/opportunities?type=2` | استثمارية: 11 pages |
| `/opportunities?type=5` | البحث عن شريك: 9 pages |
| `/opportunities?type=6` | البحث عن مستثمر لفكرة أو مشروع: 7+ pages |
| `/opportunities/{id}` | Detail page (anatomy in §4) |
| `/services` | Services grid, 4 category tabs, "تسجيل كشركة" button, "اطلب الآن" on each card |
| `/services/{id}` | Service detail with a "طلب الخدمة" button (form is behind login) |
| `/consultants` | "المستشارون المعتمدون" with **5** cards. Each has "طلب استشارة" and "المزيد" |
| `/consultants/{id}` | Consultant profile with a login-to-book CTA |
| `/culture-center` | Audience selector ("رائد أعمال" / "رائد أعمال ومستثمر") and 5 YouTube videos under "تأسيس مشروعك" |
| `/articles` | Article list, 5 pages, no search or categories |
| `/articles/{slug}` | Article body, 2 related articles, CTA text pointing to the opportunity types. No share buttons, no author |
| `/faq` | 7 questions. **Answers not rendered.** `#guide` holds a one-paragraph user guide and a PDF link (`/documents/profile.pdf`) |
| `/about-us` | من نحن, نشاط الشركة, تأسيس الشركة (launched 25 Jun 2023), القيم, الرؤية (with principles), and a profile PDF |
| `/contact-us` | Contact form, address, email `info@forsh.sa`, phone/WhatsApp, and **a bank IBAN shown publicly** |
| `/terms-and-conditions` | Commission pledge (2.5%), disclaimers, IP, content-edit rights, image licence, data protection |
| `/profile/new-opportunity` | → **`/login`** (auth wall) |
| `/login` | Mobile / email toggle, phone field, "تسجيل الدخول". Link to `/register?to=/profile/new-opportunity` |
| `/register` | Single-step registration form (§5.2) |

**Navigation problems:** in the main nav, **الفرص, الخدمات, المصادر and عن فرصة وتمكين have no href** (they are dropdowns or unlinked). Only الرئيسية, المستشارون and مركز الثقافة are direct links. Footer "روابط هامة" carries the real IA: the 4 opportunity types, services, FAQ, guide, articles, culture center, about, contact and terms.

---

## 2. Personas and current end-to-end journeys

### 2.1 Investor or buyer (individual, angel, or company)
1. **Discover:** home featured strip (4 items) or footer type links. There are no stats and no "how it works".
2. **Browse:** `/opportunities` sidebar with type, category, city (17 checkboxes) and a price range of 0–300M. Sort: lowest price, highest price, newest, oldest. **No keyword search, no stage/revenue/equity filters, no map, no saved searches.**
3. **Card:** type label, title, truncated raw description, price "ر.س", city, category, an unlabelled counter (views), and a "مميزة" badge. Many cards have **no title** (only the city as heading) or a generic title ("البحث عن شريك", "شركة محاماة").
4. **Detail:** image slider, badges, price in digits and in words, city/address, a 4-metric strip (area / age / branches / employees), and a free-text description. **No visible H1 title** (the title appears only in `<title>`).
5. **Contact:** **no contact, inquiry, NDA, save, share or report action on the listing.** The only route is the generic footer WhatsApp or the `/contact-us` form, so every lead is routed manually through the platform's WhatsApp.
6. **Post-action:** nothing. There is no inquiry tracking, no status, no data room and no deal pipeline.

### 2.2 Seller (shop or project owner) and listing owner
1. Click "إضافة فرصة" and get redirected to `/login`, then `/register` (the `to=` param returns them to the form).
2. Registration is a single step with 7 fields, terms consent, and a **sworn 2.5% commission pledge**.
3. Add-opportunity form: **not observable without an account.** We infer its fields from the detail page: type, title, category, city, address, price (plus price-in-words), unit area, project age, branch count, employee count, description, and images. There is no structured financials, equity, stage, or document upload.
4. After posting: no visible moderation status, no lead inbox, no performance stats.

### 2.3 Entrepreneur or idea owner (type 6) and partner seeker (type 5)
The flow is the same as the seller's. Because the form is generic, idea-stage listings are forced into the same fields (area, branches, employees = 0 or "1 m²"). Pitches arrive as long, unstructured prose that opens with greetings such as "السلام عليكم".

### 2.4 Service seeker
`/services` → category tab → "اطلب الآن" → `/services/{id}` (price, struck price, duration, deliverables, requirements) → "طلب الخدمة" → login → request form *(not observable)*. No checkout, no scheduling, no provider reviews.

### 2.5 Consultation seeker
`/consultants` → card (initial-letter avatar, specialty, years, "5 · n sessions") → "المزيد" opens `/consultants/{id}` (bio, tags, contact hours Sun–Thu, language, **fee 50 SAR, symbolic and non-refundable**) → "سجل الدخول لطلب استشارة" → login → request form *(not observable)*. No calendar slots are visible.

### 2.6 Service provider or company
`/services` → "تسجيل كشركة" → registration (the user-type dropdown presumably includes provider/company). The provider card shows a name, city, "معتمد" and completed orders. 4 of 7 providers show **0 orders** and several have no service cards.

### 2.7 Learner (content)
Articles and culture-center videos. Neither surface cross-links to matching opportunities apart from a text CTA in articles.

---

## 3. Listing filters (as observed)

| Filter | Control | Notes |
|---|---|---|
| نوع الفرصة | checkbox list | Option labels *(not rendered)*. Duplicated by the footer quick links |
| الفئة | checkbox list | Labels *(not rendered)*. Values seen on cards: تجاري، تغذية، تقني، صناعي، خدمي، طبي، تعليمي، رياضي، لوجستي، أخرى |
| المدينة | 17 checkboxes + "جميع المدن" | الرياض، جده، مكه، الدمام، المدينة المنورة، القصيم، أبها، تبوك، حائل، عرعر، جازان، نجران، سكاكا، الباحة، الطائف، الخبر، الأحساء |
| السعر | range 0 – 300,000,000 | A single slider over 8 orders of magnitude is unusable at low values |
| الترتيب | 4 options | الأقل سعرًا، الأعلى سعرًا، الأحدث، الأقدم. No "most viewed" and no "featured first" |
| Missing | — | Keyword search, stage (idea/operating), revenue/profit, equity %, verified-only, has-financials, NDA-required, region, date posted |

---

## 4. Opportunity detail anatomy (current)

1. Header and nav
2. Breadcrumb `/ › الفرص › تفاصيل الفرصة` (generic, not the listing name)
3. **Footer-style brand block and "روابط هامة" rendered before the content** in the DOM order
4. Image slider (1–4 images from `api.forsh.sa/storage`)
5. Badges: `مميزة`, category
6. Price: "750,000 ر.س / سبعمائة وخمسون ألف ريال". The written-out words contain typos (e.g. "مليوم وخمسمئة ريال" for 1.5M)
7. City and "العنوان". The address field is often misused (e.g. it repeats the business name, holds ".", or names a different city: #1021 city جدة, address جازان)
8. Metrics strip: مساحة الوحدة · عمر المشروع · عدد الفروع · عدد الموظفين. There is no unit on age, and placeholder values such as "1 m²" or "0 employees" appear
9. Description (free text). Key numbers such as equity %, revenue, margin, payback and NDA terms are buried inside it
10. **Absent:** visible H1, type label, owner/verification, posted date, views on the detail page, contact/inquiry CTA, NDA request, save/share/report, similar listings, financial snapshot, documents, and a map

---

## 5. Forms inventory

### 5.1 Contact (`/contact-us`)
الاسم الأول · الاسم الاخير · البريد إلكتروني · رقم الهاتف · الموضوع · نص الرسالة → "ارسل طلب". No subject dropdown, no link to a specific opportunity, and no required markers.

### 5.2 Register (`/register`)
الاسم الأول · الاسم الاخير · **نوع المستخدم** (select, options *not rendered*) · البريد · رقم الهاتف · كلمة المرور (+ show) · تأكيد كلمة المرور (+ show) · ☐ أوافق على الشروط والأحكام · ☐ تعهد بدفع عمولة 2.5% → "تسجيل". No OTP or Nafath step, no social login, single step.

### 5.3 Login (`/login`)
Toggle: via mobile / via email · رقم الهاتف (or email) → "تسجيل الدخول". Link to register with a `to=` return param.

### 5.4 Add opportunity (`/profile/new-opportunity`)
Behind login, so it could not be observed. Fields inferred from detail output: type, title, category, city, address, price, unit area, project age, branches, employees, description, images.

### 5.5 Service request and consultation request
Behind login, so they could not be observed. Service pages list **متطلبات الخدمة** as plain text (project details, investment amount, costs, revenues, existing studies), which suggests a free-text or upload form.

---

## 6. Contact and inquiry mechanics today
- No in-listing contact. The only routes are the global WhatsApp (`wa.me/966555341403`), `/contact-us`, and `info@forsh.sa`. The platform acts as a manual broker, which protects the 2.5% commission but cannot scale and gives buyers no self-serve path.
- "NDA" exists **only as a sentence in descriptions** (#1124, #932: "تُشارك التفاصيل بعد توقيع اتفاقية عدم الإفصاح"). There is no NDA document, e-signature or gated data room.
- The commission is enforced through a sworn pledge at sign-up and in the terms (within 10 days of receiving full payment). There is no escrow and no deal registration.

## 7. Services and consultants
- **Services:** 4 tabs: الخدمات القانونية، خدمات الأعمال، خدمات التصميم والتسويق، الخدمات المالية والاستشارية. ~29 services from 8 providers. The platform itself provides 16 of them (feasibility study 4,000; investment file 5,000; business model 2,000; brand identity 6,000; SEO 2,340 …). Third-party legal and audit services show discounts (e.g. contract drafting 2,500 instead of 5,000, −50%). The grid has price-format bugs ("6,0000", "2,4000", "1000" for 100), durations without units ("5", "2"), and **no images**.
- **Consultants:** 5 listed (the report says 4): فهد السويلم (تأسيس المشاريع, 17y), عبدالله السويلم (الاستراتيجية والتطوير المؤسسي, 13y), مالك حباب (إدارة المشاريع التقنية, 13y), رائد الحقباني (الحلول التقنية والتحول الرقمي, 12y), محمد القلعي (الالتزام وإدارة المخاطر, 13y). All are rated 5 with 0–2 sessions. There are no photos, the fee is 50 SAR, and there is no slot picker before login.

## 8. Culture center video categories
- Audience selector: **رائد أعمال** / **رائد أعمال ومستثمر**.
- Playlist **"تأسيس مشروعك"** (203 total views): خطوات إدارة مشروعك (26XI3edsVbk), كيف تحمي مشروعك وتضمن استدامته (CKvGRDFStIw), كيف تحول الفكرة إلى كيان استثماري (i2af6b8Ap0w), إدارة الأزمات وتعديل المسار (_udmCRZrowE), أنواع التمويل: من أين تبدأ؟ (jlO6oqFq28M).
- Counts are unlabelled. There are no durations, no transcripts and no links to related opportunities or services.

---

## 9. UX pain points, ranked (most damaging first)

1. **No contact or inquiry action on listings.** A marketplace whose core job is matching gives the buyer no button on the detail page. Every lead goes through one generic WhatsApp number or a generic contact form. Conversion is invisible and impossible to attribute.
2. **No NDA or gated-information flow.** Top listings (#1124, #932, #704) promise details "after NDA" or "for serious buyers" with no mechanism behind the promise. Sellers of profitable businesses therefore under-disclose, and buyers cannot get to the numbers.
3. **Weak trust signals.** There is no verified-owner, CR (commercial registration) or licence badge, no owner profile and no posted date. The terms disclaim all responsibility for accuracy. The public IBAN on the contact page and the "sworn commission" checkbox at sign-up create friction before any value is delivered. Every consultant is rated "5" off 0–2 sessions, which reads as fake.
4. **Unstructured descriptions carry all the decision data.** Equity %, revenue, margin, payback, reason for sale, use of funds and NDA terms are buried in prose. The structured fields (area / age / branches / employees) are the least decision-relevant and are often garbage ("1 m²", "0 employees", the address field set to "." or to another city).
5. **Data-quality failures on cards and in detail.** There are titleless cards (the city used as title), generic titles ("البحث عن شريك"), prices that are clearly mis-entered (600 SAR for a 600K ask, 25 SAR for a lease, 5,000 for a tech asset), categories that contradict the content (an abaya brand under تقني, a law firm under تجاري), and type contradictions (an "idea for sale" filed under type 6; #1254 is tagged investment in its metadata but listed as partner search). Spelling errors appear in price words. Nothing in the listing form validates these.
6. **Thin discovery tools.** There is no keyword search. The price slider runs 0–300M on a single linear scale. Stage, revenue, equity, verified and region filters are missing, as are a map view and saved searches or alerts. With 45 pages of results, users are left paging.
7. **Auth wall before value, with a heavy single-step sign-up.** "إضافة فرصة", service requests and consultations all hard-redirect to login. Registration asks for 7 fields plus a legal commission pledge, with no OTP or Nafath and no progressive profiling. Users cannot preview the listing form.
8. **Broken or ambiguous information architecture.** Four of seven top-nav items have no link. On detail pages the footer link block renders above the content. The breadcrumb never names the listing. The type label is missing from the detail page. The same four type links are repeated everywhere.
9. **Home page undersells the platform.** It shows no live stats (3,782 users, 1,228 opportunities, SAR 2.47B listed value, 1.44M views), no "how it works" per persona, no success stories or closed deals, and only 4 featured listings. The value proposition is generic.
10. **Services marketplace feels unfinished.** It has price-format bugs (6,0000), durations without units, no imagery, providers with 0 orders and no services, no reviews, no deliverable timeline, and no tie-in from a listing (for example "need a valuation before you list?").
11. **FAQ answers do not render**, and the "user guide" is a single paragraph plus a PDF. Self-serve help is effectively absent.
12. **Content is siloed.** Articles and videos never surface relevant opportunities or services. Video counts are unlabelled and durations are missing. Articles have no author, no share option and no categories.
13. **No owner dashboard is visible.** There are no listing stats, inquiry inbox, edit or renew, boost or "mark as sold" options, so sellers have no reason to keep returning.
14. **Monetisation is invisible to users.** The featured badge exists, but there is no visible way to buy featuring, no listing-fee disclosure, and no pricing page. Commission terms appear only in the T&C and at sign-up.
15. **Mobile and RTL details** could not be fully verified through text capture. Very long Arabic prose blocks combined with a single dense sidebar suggest a poor mobile filter experience. There is no native app link.

---

## 10. Implications for the redesign (pointers for downstream agents)
- A primary **"أبدِ اهتمامك" (express interest)** CTA on every listing, leading to an inquiry form (budget, timeline, investor type), then a one-click e-NDA, then a gated data room. Track the steps with the `Inquiry.status` pipeline in `@forsa/data`.
- A **structured listing wizard per type** (sale: revenue, profit, reason for sale; investment: ask, equity %, use of funds, payback; partner: role sought; idea: stage, team, MVP), with validation and a live card preview.
- **Trust layer:** Nafath-verified owner, CR/licence verified badge, posted date, view and inquiry counts, platform-reviewed badge, and honest consultant ratings.
- **Search-first browse:** keyword search, a type segmented control, a log-scale price range, stage/equity/verified filters, map view and saved alerts.
- Stats band and persona entry points on the home page. Cross-sell services (valuation, investment file) inside the listing flow.
