# 04 — Personas, Journeys and User Stories: فرصة وتمكين

Phase 2 (Define) output. **Contract rules:** every story names its screens using the IDs in `docs/03-screen-inventory.md` (S01–S14). Pain points are cited as **PP1–PP15**, the ranked list in `docs/01-current-journey.md` §9. Data shapes come from `packages/data/src/types.ts` (`Opportunity`, `Inquiry`, `InquiryStatus`, `Service`, `Consultant`, `User`, `UserRole`, `PlatformStats`).

**Priority:** **MVP** means the story is built and demoed in the pitch prototype (web + iOS, mocked client-side). **Later** means it is designed or described in the pitch but not built.

**Mocking rule:** auth, OTP, Nafath, NDA e-signature, uploads, notifications and inquiries are client-side mocks (in-memory or local storage). The UI never claims to be real: OTP accepts any 4 digits in demo mode, and Nafath shows a "تجريبي" (demo) tag.

---

## 1. Personas

All names are fictional.

### P1 — خالد، صاحب مطعم يبيع مشروعه (Seller / business owner)
- **Role:** `seller`. Riyadh. Owns a café with 2 branches that has been operating for 4 years and wants to exit at around SAR 1.2M.
- **Goal:** reach serious, qualified buyers quickly without exposing his financials to competitors or to idle browsers.
- **Context:** busy and mobile-first, using WhatsApp all day. He is comfortable with Absher and Nafath but not with long web forms.
- **Frustrations today:**
  - Has to register with 7 fields and a sworn commission pledge before he can even see the listing form (PP7).
  - The form forces irrelevant fields (area, branches, employees) and gives him nowhere to put revenue, profit or the reason for sale, so he writes it all in prose (PP4).
  - Writes "details after NDA", but there is no NDA mechanism (PP2).
  - After posting, sees no views, no leads and no status. Leads arrive (or don't) through the platform's WhatsApp (PP1, PP13).

### P2 — نورة، مستثمرة ملائكية (Investor / buyer)
- **Role:** `investor`. Jeddah. Angel investor and family-office associate with a ticket of SAR 250K–3M in F&B, health and logistics.
- **Goal:** filter quickly to verified, operating businesses with real numbers, then request the data under NDA.
- **Context:** compares opportunities on desktop at work and triages on iPhone. She is sceptical of unverified claims.
- **Frustrations today:**
  - No keyword search, and a 0–300M linear price slider across 45 pages (PP6).
  - Cards without titles, mis-entered prices and wrong categories (PP5).
  - Key numbers are buried in prose, and there is no owner verification or posted date (PP3, PP4).
  - No button to contact the owner: she has to message a generic WhatsApp number and cannot track her requests (PP1).

### P3 — فيصل، رائد أعمال لديه فكرة (Entrepreneur with an idea)
- **Role:** `idea-owner` / `entrepreneur`. Dammam. Has a validated logistics-app idea with an MVP and is seeking SAR 500K for 15%.
- **Goal:** present the idea credibly (stage, team, traction, use of funds) and get investor conversations.
- **Context:** first-time founder who consumes culture-center content and may need an investment file or feasibility study.
- **Frustrations today:**
  - Type-6 listings are forced into shop fields ("1 m²", "0 employees") (PP4, PP5).
  - Has no structured way to show stage or equity, and no link between the learning content and either his listing or services (PP12).
  - Services that would help him (investment file, feasibility study) look unfinished and are not offered at the right moment (PP10).

### P4 — ريم، تبحث عن شريك تشغيلي (Partner seeker)
- **Role:** `entrepreneur`. Riyadh. Has a licensed clinic concept and capital, and needs an operating partner with medical-management experience.
- **Goal:** describe the role she needs and the split she offers, and screen candidates before sharing her plan.
- **Context:** needs two-way fit, not a buyer. Contact quality matters more than volume.
- **Frustrations today:**
  - Listings titled only "البحث عن شريك", with no "role sought" field (PP4, PP5).
  - No inquiry or NDA flow, so she has to share her number publicly or rely on the platform's WhatsApp (PP1, PP2).
  - No dashboard to compare who reached out (PP13).

### P5 — عبدالله، مستشار ومقدم خدمة (Service provider / consultant)
- **Role:** `consultant` or `service-provider` (law firm, audit firm, agency). Riyadh. 13 years in strategy, also runs a small advisory firm.
- **Goal:** get booked for paid sessions and service orders, and build a credible reputation.
- **Context:** the platform lists him with a "5 ★" from 0–2 sessions and an initial-letter avatar, and shows his firm with "0 orders".
- **Frustrations today:**
  - Ratings read as fake, there is no photo, and no slot picker is visible before login, so visitors bounce (PP3, PP10).
  - Price-format bugs ("6,0000"), durations without units, and no imagery make his services look unfinished (PP10).
  - Never appears next to the listings where his help is needed (PP12).

### P6 — فريق المنصة (Platform admin, light)
- **Role:** `admin`. Forsa operations team: moderation, deal follow-up and commission.
- **Goal:** keep listing quality high, see deals progress so the 2.5% commission is traceable, and stop routing every lead by hand.
- **Context:** today acts as a manual WhatsApp broker. The pitch shows only the user-facing effects of admin work (review status, quality flags). The admin console is out of scope.
- **Frustrations today:**
  - Every lead comes through one WhatsApp number, so nothing can be attributed or scaled (PP1, PP14).
  - Garbage data reaches the site because nothing validates it (PP5).
  - The public IBAN and the commission pledge at sign-up create distrust (PP3).

---

## 2. Target journeys (to-be)

Each step lists its screen and the pain point it removes.

### J1 — Seller lists and manages a business (P1)
| # | Step | Screen | Removes |
|---|---|---|---|
| 1 | Taps **"أضف فرصتك"** in the nav or tab bar. The wizard opens immediately with no login. | S05 | PP7 |
| 2 | Picks type **"للبيع"**. Only sale-relevant fields appear: revenue, net profit, reason for sale, branches. | S05 | PP4 |
| 3 | Enters financials. Price-in-words is generated automatically, and implausible values are flagged ("هل تقصد 600,000؟"). | S05 | PP5 |
| 4 | Adds photos, ticks **"التفاصيل بعد اتفاقية عدم الإفصاح"** and uploads the confidential P&L to the gated section. | S05 | PP2 |
| 5 | Reviews a live card preview. At **"انشر الفرصة"** he is asked to sign in with phone + OTP, then Nafath. The 2.5% commission is disclosed here in plain words. | S05 → S13 | PP7, PP14 |
| 6 | The card flies into **"فرصي"** with status **"قيد المراجعة"**, then becomes **"منشورة"**. | S05 → S06 | PP13 |
| 7 | Gets a push notification, "استفسار جديد على فرصتك", and opens the pipeline. | S06 | PP1, PP13 |
| 8 | Approves the NDA request. The buyer gets access to the documents. He moves the inquiry to **"اجتماع"** and then **"تمت الصفقة"**. | S06 | PP2, PP14 |

### J2 — Investor discovers, verifies and inquires (P2)
| # | Step | Screen | Removes |
|---|---|---|---|
| 1 | Lands on home: live value counter, stats band, "كيف تعمل المنصة" for investors. | S01 | PP9 |
| 2 | Searches "مقهى", selects **"للبيع"**, and filters city جدة, price 500K–2M (log scale), stage "قائم", **"موثّقة فقط"**. | S02 | PP6 |
| 3 | Scans cards with real titles, labelled numbers and verified badges. Saves two of them. | S02 | PP5, PP3 |
| 4 | Opens the detail page: H1 title, type label, metrics grid (revenue, margin, payback), verified owner, CR badge, posted date. | S03 | PP3, PP4, PP8 |
| 5 | Taps **"طلب تواصل"**. Signs in at this moment only (OTP). | S03 → S13 | PP1, PP7 |
| 6 | Fills a short inquiry (budget, timeline, investor type), reviews the NDA, signs and confirms with OTP. | S04 | PP1, PP2 |
| 7 | Tracks the status in **"طلباتي"**. When the owner approves, opens the documents (Face ID on iPhone). | S06, S03 | PP2, PP13 |

### J3 — Entrepreneur pitches an idea (P3)
| # | Step | Screen | Removes |
|---|---|---|---|
| 1 | Watches "كيف تحول الفكرة إلى كيان استثماري" in the culture center. Below it: "فرص مشابهة" and "خدمة: إعداد ملف استثماري". | S11 | PP12 |
| 2 | Starts the wizard with type **"مستثمر لفكرة"**. Fields: stage, team size, MVP/traction, ask, equity %, use of funds. No area or branch fields. | S05 | PP4, PP5 |
| 3 | At the financials step, sees the hint "تحتاج ملفًا استثماريًا؟" linking to the service. | S05 → S08 | PP10 |
| 4 | Publishes after OTP, picks the role "صاحب فكرة", and tracks inquiries. | S13, S06 | PP7, PP13 |

### J4 — Partner seeker screens candidates (P4)
| # | Step | Screen | Removes |
|---|---|---|---|
| 1 | Wizard with type **"البحث عن شريك"**: role sought, what she brings, proposed split, commitment. | S05 | PP4 |
| 2 | Requires an NDA before the business plan is shared. | S05 | PP2 |
| 3 | Candidates send an inquiry with their background. She compares them in the pipeline and moves one to **"اجتماع"**. | S04, S06 | PP1, PP13 |

### J5 — Consultant gets booked; service provider gets orders (P5)
| # | Step | Screen | Removes |
|---|---|---|---|
| 1 | Visitor browses **"المستشارون المعتمدون"**. Cards show a photo, specialty, years, and an honest rating ("جديد" under 3 reviews). | S09 | PP3 |
| 2 | Opens the profile and picks a slot **before** logging in. Signs in only to confirm. | S10 → S13 | PP7 |
| 3 | Fee and refund terms appear on the confirmation, with "أضف إلى التقويم". | S10 | PP14 |
| 4 | Services show a clean price, duration in days, deliverables and a provider card. Requests can attach an opportunity. | S07, S08 | PP10 |

### J6 — Platform admin (P6, light)
| # | Step | Screen | Removes |
|---|---|---|---|
| 1 | Listings arrive pre-validated, with quality flags visible to the seller before submission. | S05 | PP5 |
| 2 | Inquiries and NDA signatures are logged against the listing, so deals are attributable. | S06 | PP1, PP14 |
| 3 | The contact page drops the public IBAN, and the FAQ answers common questions. | S14 | PP3, PP11 |

---

## 3. Epics and user stories

ID format: `US-<EPIC>-<nn>`. Epic codes: DISC, OPP, INQ, LST, DASH, SRV, CNS, LRN, AUTH, A11Y, IOS, HELP, ADM.

### Epic DISC — Discovery and search

**US-DISC-01 — Home that sells the platform** · S01 · **MVP** · PP9
As a first-time visitor, I want to see what the platform has achieved and how it works for someone like me, so that I trust it enough to explore.
- **Given** I open `/`, **When** the hero loads, **Then** "فرصتك على بعد خطوة" and the value counter "2.47 مليار ر.س" (labelled "قيمة الفرص المعروضة على المنصة") count up once, and the stats band shows users, opportunities and views from `platformStats` with an "as of" date.
- **Given** the home page, **When** I scroll, **Then** I see the 4-type story, featured opportunities, the Saudi city-density map, and "كيف تعمل المنصة" with tabs for مستثمر / صاحب مشروع / صاحب فكرة.
- **Given** the hero, **Then** there is exactly one filled CTA ("استعرض الفرص") and one tinted CTA ("أضف فرصتك").

**US-DISC-02 — Keyword search** · S01, S02 · **MVP** · PP6
As an investor, I want to search opportunities by keyword, so that I find relevant businesses without paging through 45 pages.
- **Given** I am on S02, **When** I type "مقهى" in "ابحث عن مقهى، مصنع، عيادة…", **Then** results filter as I type (debounced 250ms) across title, short description, category and city in Arabic and English.
- **Given** a query with no results, **Then** I see "لا توجد نتائج مطابقة" with suggestions to clear filters or save the search.
- **Given** I search from the home hero, **When** I submit, **Then** I land on S02 with the query applied and reflected in the URL (`?q=`).

**US-DISC-03 — Type segmented control** · S02 · **MVP** · PP6, PP8
As a visitor, I want to switch between the four opportunity types in one tap, so that I only see the kind of deal I care about.
- **Given** S02, **Then** a segmented control shows "الكل · للبيع · استثمارية · البحث عن شريك · مستثمر لفكرة", each with a result count.
- **When** I select "للبيع", **Then** the list updates without a page reload, the URL becomes `?type=for-sale`, and the thumb animates with `spring.snappy` (crossfade under reduced motion).

**US-DISC-04 — Filters and sort** · S02 · **MVP** · PP6
As an investor, I want to filter by category, city, price, stage, equity and verification and sort the results, so that I see a short list that fits my mandate.
- **Given** I open "تصفية" (a sheet on mobile, a sidebar on desktop), **Then** I can set category, city (grouped by region), a **log-scale** price range (10K–300M with presets "حتى 500 ألف", "500 ألف – 2 مليون", "+2 مليون"), stage (فكرة / ناشئ / قائم / راسخ), equity range, and "موثّقة فقط".
- **When** I apply filters, **Then** active filters appear as removable chips and the result count updates ("128 فرصة").
- **Given** the sort menu, **Then** the options are "الأحدث، الأقل سعرًا، الأعلى سعرًا، الأكثر مشاهدة، المميزة أولًا".

**US-DISC-05 — Map view** · S02 · Later · PP6
As an investor focused on a region, I want to toggle between grid and map, so that I can see where opportunities cluster.
- **Given** S02, **When** I tap "عرض الخريطة", **Then** results render as city clusters with counts and total value.
- **When** I tap a cluster, **Then** the list filters to that city and the filter chip shows the city.

**US-DISC-06 — Saved search and alerts** · S02, S06, S13 · Later · PP6
As an investor, I want to save a search and be alerted when new matches appear, so that I don't have to check the site every day.
- **Given** active filters, **When** I tap "حفظ البحث", **Then** I am asked to sign in only if I'm not already (S13), and the search appears under "محفوظاتي".
- **Given** a saved search, **When** a new matching listing is published (mock), **Then** I get an in-app notice (and a push on iOS, see US-IOS-05).

### Epic OPP — Opportunity detail and trust

**US-OPP-01 — Clear header and gallery** · S02, S03 · **MVP** · PP8
As an investor, I want the detail page to name the opportunity and its type up front, so that I know immediately what I'm looking at.
- **Given** I open `/opportunities/[id]`, **Then** I see a visible H1 title, a type chip (e.g. "للبيع"), city · category, and a breadcrumb "الفرص › للبيع › {title}".
- **Given** I tap a card on S02, **When** the detail opens, **Then** the image, title and price morph into the header (shared-element transition), reversing on back (opacity crossfade under reduced motion).
- **Given** the gallery, **Then** images swipe horizontally (mirrored in RTL) with a "1 / 4" counter, and missing images fall back to a category illustration.

**US-OPP-02 — Structured key metrics** · S03 · **MVP** · PP4, PP5
As an investor, I want the decision numbers in a structured, labelled grid, so that I can compare opportunities without reading paragraphs.
- **Given** an opportunity, **Then** the metrics grid shows only relevant, non-empty fields by type: price (and "قابل للتفاوض"), equity %, annual revenue, net margin, monthly net profit, payback (months), branches, employees, area.
- **Given** a metric is undisclosed or behind the NDA, **Then** it shows "متاح بعد اتفاقية عدم الإفصاح" with a lock icon, never "0" or "1 m²".
- **Given** a price, **Then** it shows in tabular numerals with "ر.س" and a correctly generated price-in-words line (e.g. "مليون وخمسمئة ألف ريال").

**US-OPP-03 — Trust layer** · S02, S03 · **MVP** · PP3
As an investor, I want to see who is behind the listing and whether the platform verified it, so that I can judge credibility.
- **Given** a verified listing, **Then** the card and detail show "موثّقة" and the detail shows an owner block: display name, "هوية موثّقة عبر نفاذ", "سجل تجاري موثّق", and "عضو منذ 2024".
- **Given** any listing, **Then** the detail shows "نُشرت قبل 3 أيام", "مشاهدات 1,120" and "استفسارات 14", always with labels.
- **Given** an unverified listing, **Then** it shows a neutral "غير موثّقة بعد" note and no green badge.

**US-OPP-04 — Save an opportunity** · S02, S03, S06 · **MVP** · PP6
As an investor, I want to save opportunities, so that I can shortlist and come back later.
- **Given** a card or detail page, **When** I tap "حفظ", **Then** the icon fills, a toast "تم الحفظ في محفوظاتي" appears, and the item shows under "محفوظاتي" in S06.
- **Given** I'm a guest, **Then** saving works locally and is merged into my account on sign-in (no gate for saving).

**US-OPP-05 — Similar opportunities and service cross-sell** · S03 · **MVP** · PP10, PP12
As an investor, I want to see similar listings and relevant services on the detail page, so that I can keep exploring and get help to evaluate.
- **Given** a detail page, **Then** "فرص مشابهة" shows up to 4 listings of the same type or category, excluding the current one.
- **Given** a for-sale or investment listing, **Then** a tinted card offers "تحتاج تقييمًا قبل الشراء؟ اطلب دراسة جدوى" linking to S08.

**US-OPP-06 — Report a listing** · S03 · Later · PP5
As a user, I want to report a misleading listing, so that the platform keeps quality high.
- **Given** the "…" menu on S03, **When** I choose "الإبلاغ عن الفرصة" and pick a reason (سعر غير صحيح، تصنيف خاطئ، محتوى مضلل، أخرى), **Then** I see "شكرًا، سيراجع فريق المنصة البلاغ".

### Epic INQ — Inquiry and NDA

**US-INQ-01 — Express interest CTA** · S03 · **MVP** · PP1
As an investor, I want a clear primary action on every listing, so that I can contact the owner without going through WhatsApp.
- **Given** any opportunity detail, **Then** a filled large button **"طلب تواصل"** is always visible (sticky bottom bar on mobile, side panel on desktop).
- **Given** I'm the listing owner, **Then** the button is replaced by "إدارة الفرصة" linking to S06.
- **Given** I already inquired, **Then** the button reads "عرض حالة طلبك" and shows the current status.

**US-INQ-02 — Inquiry form** · S04, S13 · **MVP** · PP1, PP7
As an investor, I want to send a short structured inquiry, so that the owner sees I'm serious.
- **Given** I tap "طلب تواصل" as a guest, **When** the sheet opens, **Then** I'm asked to sign in (S13) and return to the same step with nothing lost.
- **Given** the form, **Then** it asks for a message (with a suggested opener), budget range, timeline (فوري / خلال 3 أشهر / خلال 6 أشهر), and investor type (فرد / مستثمر ملائكي / شركة / صندوق), prefilled from my profile.
- **When** I submit without a message, **Then** the inline error reads "اكتب رسالة قصيرة للمالك" and focus moves to the field.

**US-INQ-03 — NDA review and e-sign** · S04, S13 · **MVP** · PP2
As an investor, I want to sign the listing's NDA in the app, so that I can access confidential details without paperwork.
- **Given** an `ndaRequired` listing, **When** I continue from the form, **Then** I see "اتفاقية عدم الإفصاح" with a plain-language summary (3 bullets) and the full text expandable.
- **When** I tick "اطلعت على الاتفاقية وأوافق عليها" and tap "وقّع الاتفاقية", **Then** a 4-digit OTP is sent (mock) and verified before the signature is recorded with my name and a timestamp.
- **Given** a listing without an NDA, **Then** this step is skipped and the inquiry is sent directly.

**US-INQ-04 — Confirmation and status tracking** · S04, S06 · **MVP** · PP1, PP13
As an investor, I want confirmation and a visible status, so that I know what happens next.
- **When** the inquiry is sent, **Then** a success state shows "تم إرسال طلبك للمالك" with next steps and the `Inquiry.status` = `new` (or `nda-signed` when signed).
- **Given** "طلباتي" in S06, **Then** each inquiry shows the listing, status chip (جديد، بانتظار الموافقة، وُقّعت الاتفاقية، قيد النقاش، اجتماع، تمت الصفقة، مغلق) and last update.

**US-INQ-05 — Gated documents (data room)** · S03, S06 · **MVP** · PP2, PP4
As an investor who signed an NDA, I want to open the confidential documents once the owner approves, so that I can do due diligence.
- **Given** I signed but the owner hasn't approved, **Then** the "المستندات السرية" section on S03 shows the file names with a lock and "بانتظار موافقة المالك".
- **Given** the owner approved (US-DASH-03), **When** I open a document, **Then** it opens in a viewer with a watermark "سري — {my name} — {date}" (on iOS behind Face ID, US-IOS-04).

### Epic LST — Listing creation

**US-LST-01 — Start listing without an account** · S05 · **MVP** · PP7
As a seller, I want to start my listing immediately, so that I see the value before committing to sign-up.
- **Given** I tap "أضف فرصتك" as a guest, **Then** the wizard opens on the type step with no login.
- **Given** I leave mid-way, **When** I return on the same device, **Then** I see "أكمل من حيث توقفت" with the draft restored (autosaved locally).

**US-LST-02 — Type-specific fields** · S05 · **MVP** · PP4, PP5
As a listing owner, I want the form to ask only questions that fit my type, so that my listing is clear and complete.
- **Given** type "للبيع", **Then** basics include title, category, city, stage, reason for sale, branches and employees.
- **Given** "استثمارية", **Then** it asks for required investment, equity %, use of funds and expected payback. **Given** "البحث عن شريك", it asks for role sought, what I bring, proposed split and commitment. **Given** "مستثمر لفكرة", it asks for stage, team size, MVP/traction, ask and equity %, with **no** area, branch or employee fields.
- **Given** the title field, **Then** it is required, 10–80 characters, and cannot equal the type name or city alone.

**US-LST-03 — Financials with validation** · S05 · **MVP** · PP5
As a seller, I want help entering numbers correctly, so that my listing isn't dismissed for obvious errors.
- **When** I type a price, **Then** thousands separators and the price-in-words are generated live, and I can mark "قابل للتفاوض".
- **Given** a price below 10,000 for a for-sale business, **Then** a soft warning asks "هل تقصد 600,000 ر.س؟" with a one-tap fix.
- **Given** equity outside 1–100 or a margin above 100%, **Then** an inline error blocks the next step.

**US-LST-04 — Media and confidential files** · S05 · **MVP** · PP2, PP10
As a seller, I want to add photos and private documents separately, so that the public sees the business and only NDA signers see the numbers.
- **Given** the media step, **When** I add up to 10 images, **Then** I can reorder them and choose a cover, and the 16:10 crop is previewed.
- **Given** "التفاصيل بعد اتفاقية عدم الإفصاح" is on, **Then** a second area "مستندات سرية" accepts PDF/XLSX (mock) and these files are never shown publicly.

**US-LST-05 — Live preview and review** · S05 · **MVP** · PP5
As a seller, I want to see exactly how my card and detail page will look, so that I can fix issues before publishing.
- **Given** any wizard step on desktop, **Then** a live card preview updates beside the form. On mobile, "معاينة" opens it.
- **Given** the review step, **Then** every section is summarised with "تعديل" links, and quality flags (US-ADM-01) are listed.

**US-LST-06 — Publish, commission disclosure and handoff to dashboard** · S05, S13, S06 · **MVP** · PP7, PP13, PP14
As a seller, I want to publish in one step and see my listing in my dashboard, so that I know it's live and what it costs.
- **Given** I tap "انشر الفرصة" as a guest, **Then** phone + OTP sign-in (S13) appears, and I return to the review step already signed in.
- **Given** the publish confirmation, **Then** it states plainly "النشر مجاني. عمولة المنصة 2.5% من قيمة الصفقة عند إتمامها فقط" with a link to the terms, and requires one checkbox (no sworn pledge at sign-up).
- **When** published, **Then** the card flies into "فرصي" with status "قيد المراجعة" (`spring.bouncy`, plus a success haptic on iOS), then flips to "منشورة" (mock, ~3s).

### Epic DASH — Dashboard and inquiry pipeline

**US-DASH-01 — My listings with stats** · S06 · **MVP** · PP13
As a listing owner, I want to see how each listing performs, so that I know whether it's working.
- **Given** "فرصي", **Then** each listing shows its status (مسودة، قيد المراجعة، منشورة، تم البيع), views, saves, inquiries and days live.
- **Given** a listing with views but 0 inquiries after 14 days (mock), **Then** a tip suggests "أضف الأرقام المالية لزيادة الاستفسارات".

**US-DASH-02 — Inquiry pipeline** · S06 · **MVP** · PP1, PP13
As a listing owner, I want all inquiries in one pipeline, so that I can manage buyers without WhatsApp chaos.
- **Given** "الطلبات الواردة", **Then** inquiries are grouped into columns on desktop and segments on iPhone: جديد → اتفاقية السرية → قيد النقاش → اجتماع → مغلق, mapped to `InquiryStatus`.
- **Given** an inquiry card, **Then** it shows the inquirer's name, verified badge, investor type, budget range, listing and time, and opens a detail with the message.
- **Given** new inquiries, **Then** the Inbox tab shows a badge count.

**US-DASH-03 — Approve NDA and grant document access** · S06 · **MVP** · PP2
As a seller, I want to approve or decline access after an NDA is signed, so that I control who sees my numbers.
- **Given** an inquiry with status `nda-signed`, **When** I tap "منح الوصول للمستندات", **Then** the investor's data room unlocks (US-INQ-05) and the status becomes `in-discussion`.
- **When** I tap "اعتذار", **Then** I can pick a polite templated reason and the inquiry moves to `closed-lost`.

**US-DASH-04 — Move stages and close deals** · S06 · **MVP** · PP13, PP14
As a seller, I want to move an inquiry through stages and mark the deal closed, so that both sides and the platform see progress.
- **When** I drag a card (web) or use "نقل إلى…" (iOS), **Then** the status updates and the investor sees it in "طلباتي".
- **When** I mark "تمت الصفقة", **Then** I'm asked for the final deal value (optional), the listing can be set to "تم البيع", and the commission note "2.5% مستحقة خلال 10 أيام من استلام كامل المبلغ" is shown.

**US-DASH-05 — Saved items and my requests** · S06 · **MVP** · PP13
As any user, I want my saved opportunities, inquiries, service requests and bookings in one place, so that I can pick up where I left off.
- **Given** the profile area, **Then** I see tabs "محفوظاتي", "طلباتي" (inquiries I sent), and "خدماتي ومواعيدي" (service requests and consultant bookings with status).
- **Given** an empty tab, **Then** I see a helpful empty state with a CTA (e.g. "استعرض الفرص").

**US-DASH-06 — Edit, renew and mark as sold** · S06, S05 · Later · PP13, PP14
As a seller, I want to edit, renew, pause or mark my listing sold, and see how to feature it, so that I keep it accurate and visible.
- **Given** a published listing, **When** I choose "تعديل", **Then** the wizard opens prefilled, and saving sends it back to "قيد المراجعة" only if price or type changed.
- **Given** "تمييز الفرصة", **Then** a pricing sheet shows featured-placement options and fees (no payment in the pitch).

### Epic SRV — Services

**US-SRV-01 — Clean service catalog** · S07 · **MVP** · PP10
As an entrepreneur, I want to browse services by category with clear prices and durations, so that I can quickly find the help I need.
- **Given** S07, **Then** tabs show "قانونية · أعمال · تصميم وتسويق · مالية واستشارية", and each card has an icon or image, title, provider, price formatted correctly ("6,000 ر.س"), and duration with units ("5 أيام عمل").
- **Given** a discounted service, **Then** the original price is struck through with a "-50%" badge.

**US-SRV-02 — Service detail** · S08 · **MVP** · PP10
As an entrepreneur, I want to see deliverables, requirements, timeline and who provides the service, so that I know exactly what I'm paying for.
- **Given** S08, **Then** I see sections "ماذا ستحصل عليه", "المطلوب منك", "مدة التنفيذ", and a provider card ("معتمد", completed orders, city).
- **Given** a provider with 0 completed orders, **Then** it shows "مقدم خدمة جديد" instead of "0 طلبات".

**US-SRV-03 — Request a service** · S08, S13, S06 · **MVP** · PP7, PP10
As an entrepreneur, I want to request a service and link it to my listing, so that the provider has context.
- **Given** I tap "اطلب الخدمة" as a guest, **Then** S13 opens and returns me to the request sheet.
- **Given** the request sheet, **Then** I can add a note, attach one of my opportunities ("اربط بفرصة من فرصي"), and upload requirements (mock), then see "تم استلام طلبك" with the request in "خدماتي ومواعيدي".

**US-SRV-04 — Provider profile and onboarding** · S07, S08, S13 · Later · PP3, PP10
As a service provider, I want a profile page and a simple way to register my firm, so that clients trust me and I can list services.
- **Given** "سجّل كمقدم خدمة", **Then** onboarding asks for company name, CR number (mock verification), category and logo.
- **Given** a provider profile, **Then** it lists services, completed orders and reviews, with honest ratings (no stars under 3 reviews).

### Epic CNS — Consultants and booking

**US-CNS-01 — Consultants list** · S09 · **MVP** · PP3
As an entrepreneur, I want to compare consultants by specialty and experience, so that I pick the right expert.
- **Given** S09 ("المستشارون المعتمدون"), **Then** cards show photo (or a designed monogram), name, specialty, years, sessions, fee "50 ر.س للجلسة" and next available slot.
- **When** I filter by specialty chip (تأسيس المشاريع، الاستراتيجية، التحول الرقمي، الالتزام والمخاطر…), **Then** the list updates.

**US-CNS-02 — Profile with honest reputation** · S10 · **MVP** · PP3
As an entrepreneur, I want a credible consultant profile, so that I trust the rating.
- **Given** a consultant with fewer than 3 reviews, **Then** the rating shows "جديد على المنصة" instead of "5 ★".
- **Given** the profile, **Then** I see bio, tags, languages, availability (أحد – خميس) and "معتمد", with no fake precision.

**US-CNS-03 — Slot picker before login** · S10 · **MVP** · PP7
As an entrepreneur, I want to see and pick an available time before signing in, so that I don't hit a wall.
- **Given** S10, **Then** a 14-day date strip and time slots (mock, in Riyadh time) are visible to guests.
- **When** I pick a slot and tap "احجز الموعد", **Then** sign-in appears only now, and the chosen slot is held for 10 minutes.

**US-CNS-04 — Confirm booking** · S10, S06 · **MVP** · PP14
As an entrepreneur, I want a clear confirmation with fee terms, so that I know what I agreed to.
- **Given** the confirmation, **Then** it shows consultant, date and time, duration, fee 50 ر.س, and "الرسوم رمزية وغير مستردة" before I confirm.
- **When** confirmed, **Then** I see "تم تأكيد موعدك" with "أضف إلى التقويم", and the booking appears in "خدماتي ومواعيدي". No payment is taken in the pitch.

### Epic LRN — Culture center and articles

**US-LRN-01 — Culture center linked to action** · S11 · **MVP** · PP12
As an entrepreneur, I want videos grouped by audience with clear durations and links to relevant opportunities and services, so that learning leads to action.
- **Given** S11, **Then** an audience switch "رائد أعمال / مستثمر" filters categories, and each video shows its duration and a labelled view count ("مشاهدات 26").
- **When** I play a video, **Then** it plays in an inline player (YouTube nocookie), and below it I see "فرص ذات صلة" (up to 3) and one related service.

**US-LRN-02 — Articles with author, share and related opportunities** · S12 · **MVP** · PP12
As a reader, I want articles with author, reading time and related opportunities, so that content is credible and useful.
- **Given** `/articles/[slug]`, **Then** I see title, author ("فريق فرصة وتمكين" if unknown), date, "4 دقائق قراءة", a table of contents from `headings`, and a share button.
- **Given** an article with `relatedTypes`, **Then** the end of the article shows 3 opportunities of those types and a CTA "أضف فرصتك".

### Epic AUTH — Authentication (gate only at the moment of action)

**US-AUTH-01 — Browse freely, gate at action, return to intent** · S13 (all) · **MVP** · PP7
As a visitor, I want to explore everything without an account and be asked to sign in only when I act, so that I see value first.
- **Given** I'm a guest, **Then** S01, S02, S03 (public parts), S07–S12 and S14 are fully accessible.
- **Given** I trigger a gated action (inquire, publish, request service, book, save search), **When** I finish signing in, **Then** I return to the exact step with my input preserved.

**US-AUTH-02 — Phone + OTP sign-in** · S13 · **MVP** · PP7
As a user, I want to sign in with my mobile number and a code, so that I don't need a password.
- **Given** the sheet "سجّل دخولك برقم جوالك", **When** I enter a Saudi number (+966 5XXXXXXXX validated), **Then** a 4-digit code screen appears with a 60-second resend timer and iOS one-time-code autofill.
- **When** I enter a wrong code three times, **Then** I see "الرمز غير صحيح" and must request a new code.
- **Given** a new number, **Then** the account is created on verification. There is no separate registration form.

**US-AUTH-03 — Nafath verification (mocked)** · S13, S03 · **MVP** · PP3
As a seller or investor, I want to verify my identity with Nafath, so that others see I'm real.
- **Given** I publish a listing or sign an NDA unverified, **Then** I'm offered "وثّق هويتك عبر نفاذ" (skippable for inquiries, required to publish in the pitch).
- **When** I start it, **Then** a mock screen shows a 2-digit number "افتح تطبيق نفاذ واختر الرقم 47", and after ~3s my profile becomes `verified: true` and shows "هوية موثّقة".

**US-AUTH-04 — Role picker and progressive profile** · S13 · **MVP** · PP7
As a new user, I want to tell the platform what I'm here for in one tap, so that it shows me relevant things without a long form.
- **Given** first sign-in, **Then** I pick one or more of "أبحث عن فرصة (مستثمر)، أبيع مشروعي، لدي فكرة، أبحث عن شريك، أقدم خدمات أو استشارات", mapped to `UserRole`.
- **Then** only my name is required now. Other details (city, investor type, budget) are asked in context later (e.g. in the inquiry form).

### Epic A11Y — Bilingual and accessibility

**US-A11Y-01 — Arabic first, English toggle** · all · **MVP**
As a user, I want the app in Arabic by default with a switch to English, so that I can use my preferred language.
- **Given** first visit, **Then** the UI is Arabic with `dir="rtl"`, and "English" in the nav switches to LTR with the same layout mirrored via logical properties.
- **Given** I switch language, **Then** the choice persists (local storage on web, device language by default on iOS) and directional icons mirror correctly.

**US-A11Y-02 — Numbers, currency and dates** · all · **MVP** · PP5
As a user, I want numbers and prices to read correctly in both languages, so that I never misread a value.
- **Given** any price, **Then** it uses tabular numerals, thousands separators, "ر.س" / "SAR", and is wrapped in `<bdi>` to prevent bidi reordering.
- **Given** large values, **Then** compact forms are used where space is tight ("2.47 مليار ر.س", "SAR 2.47B"), with the full value in the accessible label.

**US-A11Y-03 — Reduced motion** · all · **MVP**
As a motion-sensitive user, I want animations reduced, so that the app is comfortable to use.
- **Given** `prefers-reduced-motion` (or iOS Reduce Motion), **Then** transforms become 150ms crossfades, parallax and magnetic effects are off, and the hero counter shows its final value immediately.

**US-A11Y-04 — Screen readers, targets, text size and contrast** · all · **MVP**
As a user with a visual or motor impairment, I want the app to work with VoiceOver, keyboard and larger text, so that I can use it independently.
- **Given** VoiceOver or a web screen reader, **Then** every card reads as one element ("مقهى مختص في جدة، للبيع، 1,200,000 ريال، موثّقة"), and icon-only buttons have Arabic and English labels.
- **Given** keyboard use on web, **Then** focus is visible (`:focus-visible` ring) and sheets trap and restore focus. All hit targets are ≥44×44pt.
- **Given** iOS Dynamic Type up to AX3 or browser zoom at 200%, **Then** layouts reflow without truncating prices or CTAs, and text meets WCAG AA contrast in light and dark modes.

### Epic IOS — iOS-specific

**US-IOS-01 — Native navigation shell** · S01–S06 (iOS) · **MVP** · PP8
As an iPhone user, I want familiar native navigation, so that the app feels at home on iOS.
- **Given** the app, **Then** a floating glass tab bar shows "اكتشف · الفرص · (+) أضف · الوارد · حسابي", and the "+" opens the S05 sheet.
- **Given** a scrolling screen, **Then** the large title collapses into a glass nav bar with a hairline after 8pt of scroll, and swipe-back works (mirrored in RTL).

**US-IOS-02 — Haptics with purpose** · S02–S06, S10 · **MVP**
As an iPhone user, I want subtle haptic feedback on meaningful actions, so that I feel confident something happened.
- **Given** these events, **Then** haptics fire as mapped: segmented control and filter change → selection; save → light impact; NDA signed, listing published, booking confirmed → success notification; validation error → error notification.
- **Given** a device without haptics or with system haptics off, **Then** no errors occur and nothing else changes.

**US-IOS-03 — Share sheet** · S03, S08, S10, S12 · **MVP**
As a user, I want to share an opportunity, service, consultant or article through the iOS share sheet, so that I can send it to a partner on WhatsApp.
- **When** I tap "مشاركة" on S03, **Then** the native share sheet opens with the title, price, and the web URL `https://forsh.sa/opportunities/{id}` (rich link preview).
- **Given** an NDA-required listing, **Then** only public fields are included in the shared text.

**US-IOS-04 — Face ID gate for NDA documents** · S03, S06 · **MVP** · PP2
As an investor, I want confidential documents protected by Face ID, so that nobody else holding my phone can open them.
- **Given** I'm approved for a data room, **When** I tap a document, **Then** Face ID (or Touch ID or the passcode fallback) is requested with the reason "للوصول إلى المستندات السرية".
- **When** authentication fails or is cancelled, **Then** the document stays locked with "تعذّر التحقق، حاول مرة أخرى".
- **Given** the app goes to the background, **Then** the document viewer is blurred in the app switcher.

**US-IOS-05 — Push notification stubs** · S06, S13 · **MVP** (stub)
As a user, I want to be notified about new inquiries, NDA approvals and bookings, so that I respond quickly.
- **Given** my first meaningful action (publishing a listing or sending an inquiry), **Then** a pre-permission explainer "فعّل التنبيهات لتعرف فور وصول استفسار" appears before the system prompt, and never at app launch.
- **Given** a mock event (new inquiry, NDA approved, booking reminder), **Then** a local notification fires and tapping it deep-links to the right screen (S06 inquiry or S03 documents).

### Epic HELP — About, FAQ and Contact

**US-HELP-01 — FAQ that answers** · S14 · **MVP** · PP11
As a visitor, I want FAQ answers that actually render and are searchable, so that I can help myself.
- **Given** `/faq`, **Then** questions are grouped (عام، الإدراج، الرسوم، الثقة والأمان، الدعم) and each opens an answer accordion, with mock answers marked internally (`answerIsMock`).
- **When** I search "العمولة", **Then** matching questions filter live, and each answer can end with a related action link.

**US-HELP-02 — Contact and About done right** · S14 · Later · PP3, PP9
As a visitor, I want a contact form tied to my topic, and an About page with facts, so that I reach the right team and trust the company.
- **Given** `/contact`, **Then** a subject dropdown (استفسار عن فرصة، دعم فني، شراكات، أخرى), an optional opportunity link, required-field markers, and WhatsApp and email are shown, and **no IBAN** is displayed.
- **Given** `/about`, **Then** it shows the launch date (25 يونيو 2023), live stats, values and a "كيف تعمل المنصة" summary.

### Epic ADM — Platform admin (light)

**US-ADM-01 — Quality flags and review status** · S05, S06 · **MVP** · PP5
As the platform team, I want listings checked automatically before submission and shown as "قيد المراجعة", so that low-quality data never goes live unseen.
- **Given** the review step, **Then** client-side rules flag a title equal to the type or city, a price-to-type mismatch, an address city different from the selected city, placeholder metrics (1 m², 0 employees), and a description under 80 characters.
- **Given** flags remain, **When** I publish anyway, **Then** the listing is marked "قيد المراجعة — يحتاج تعديلًا" in S06 with the flags listed for me to fix.

---

## 4. Traceability

Web routes and iOS paths are from `docs/03-screen-inventory.md`. "sheet" = modal sheet on web and iOS.

| Story | Pri | Screen(s) | Web route | iOS screen |
|---|---|---|---|---|
| US-DISC-01 | MVP | S01 | `/` | `(tabs)/index` |
| US-DISC-02 | MVP | S01, S02 | `/opportunities?q=` | `(tabs)/opportunities` |
| US-DISC-03 | MVP | S02 | `/opportunities?type=` | `(tabs)/opportunities` |
| US-DISC-04 | MVP | S02 | `/opportunities` (filter sheet) | `(tabs)/opportunities` (filter sheet) |
| US-DISC-05 | Later | S02 | `/opportunities?view=map` | `(tabs)/opportunities` |
| US-DISC-06 | Later | S02, S06, S13 | `/opportunities`, `/dashboard` | `(tabs)/opportunities`, `(tabs)/profile` |
| US-OPP-01 | MVP | S02, S03 | `/opportunities/[id]` | `opportunity/[id]` |
| US-OPP-02 | MVP | S03 | `/opportunities/[id]` | `opportunity/[id]` |
| US-OPP-03 | MVP | S02, S03 | `/opportunities`, `/opportunities/[id]` | `(tabs)/opportunities`, `opportunity/[id]` |
| US-OPP-04 | MVP | S02, S03, S06 | `/opportunities/[id]`, `/dashboard` | `opportunity/[id]`, `(tabs)/profile` |
| US-OPP-05 | MVP | S03 | `/opportunities/[id]` | `opportunity/[id]` |
| US-OPP-06 | Later | S03 | `/opportunities/[id]` | `opportunity/[id]` |
| US-INQ-01 | MVP | S03 | `/opportunities/[id]` | `opportunity/[id]` |
| US-INQ-02 | MVP | S04, S13 | modal on `/opportunities/[id]` | sheet `inquiry/[id]` |
| US-INQ-03 | MVP | S04, S13 | modal on `/opportunities/[id]` | sheet `inquiry/[id]` |
| US-INQ-04 | MVP | S04, S06 | modal → `/dashboard` | `inquiry/[id]` → `(tabs)/inbox` |
| US-INQ-05 | MVP | S03, S06 | `/opportunities/[id]` | `opportunity/[id]` |
| US-LST-01 | MVP | S05 | `/add` | `(tabs)/add` |
| US-LST-02 | MVP | S05 | `/add` | `(tabs)/add` |
| US-LST-03 | MVP | S05 | `/add` | `(tabs)/add` |
| US-LST-04 | MVP | S05 | `/add` | `(tabs)/add` |
| US-LST-05 | MVP | S05 | `/add` | `(tabs)/add` |
| US-LST-06 | MVP | S05, S13, S06 | `/add` → `/dashboard` | `(tabs)/add` → `(tabs)/profile` |
| US-DASH-01 | MVP | S06 | `/dashboard` | `(tabs)/profile` |
| US-DASH-02 | MVP | S06 | `/dashboard` | `(tabs)/inbox` |
| US-DASH-03 | MVP | S06 | `/dashboard` | `(tabs)/inbox` |
| US-DASH-04 | MVP | S06 | `/dashboard` | `(tabs)/inbox` |
| US-DASH-05 | MVP | S06 | `/dashboard` | `(tabs)/profile` |
| US-DASH-06 | Later | S06, S05 | `/dashboard`, `/add` | `(tabs)/profile`, `(tabs)/add` |
| US-SRV-01 | MVP | S07 | `/services` | `services/index` |
| US-SRV-02 | MVP | S08 | `/services/[id]` | `services/[id]` |
| US-SRV-03 | MVP | S08, S13, S06 | `/services/[id]` → `/dashboard` | `services/[id]` → `(tabs)/profile` |
| US-SRV-04 | Later | S07, S08, S13 | `/services`, `/login` | `services/index`, `auth/*` |
| US-CNS-01 | MVP | S09 | `/consultants` | `consultants/index` |
| US-CNS-02 | MVP | S10 | `/consultants/[id]` | `consultants/[id]` |
| US-CNS-03 | MVP | S10 | `/consultants/[id]` | `consultants/[id]` |
| US-CNS-04 | MVP | S10, S06 | `/consultants/[id]` → `/dashboard` | `consultants/[id]` → `(tabs)/profile` |
| US-LRN-01 | MVP | S11 | `/culture-center` | `learn/index` |
| US-LRN-02 | MVP | S12 | `/articles`, `/articles/[slug]` | `learn/articles/[slug]` |
| US-AUTH-01 | MVP | S13 (all) | `/login` (sheet, any route) | `auth/*` |
| US-AUTH-02 | MVP | S13 | `/login` | `auth/*` |
| US-AUTH-03 | MVP | S13, S03 | `/login` | `auth/*` |
| US-AUTH-04 | MVP | S13 | `/login` | `auth/*` |
| US-A11Y-01 | MVP | all | all (`/en/*` for English) | all |
| US-A11Y-02 | MVP | all | all | all |
| US-A11Y-03 | MVP | all | all | all |
| US-A11Y-04 | MVP | all | all | all |
| US-IOS-01 | MVP | S01–S06 | — | `(tabs)/*` |
| US-IOS-02 | MVP | S02–S06, S10 | — | `(tabs)/opportunities`, `opportunity/[id]`, `inquiry/[id]`, `(tabs)/add`, `(tabs)/inbox`, `consultants/[id]` |
| US-IOS-03 | MVP | S03, S08, S10, S12 | — (web uses Web Share API / copy link) | `opportunity/[id]`, `services/[id]`, `consultants/[id]`, `learn/articles/[slug]` |
| US-IOS-04 | MVP | S03, S06 | — | `opportunity/[id]`, `(tabs)/inbox` |
| US-IOS-05 | MVP (stub) | S06, S13 | — | `(tabs)/inbox`, `auth/*` |
| US-HELP-01 | MVP | S14 | `/faq` | `profile/faq` |
| US-HELP-02 | Later | S14 | `/contact`, `/about` | `profile/about` |
| US-ADM-01 | MVP | S05, S06 | `/add`, `/dashboard` | `(tabs)/add`, `(tabs)/profile` |

**Pain-point coverage:** PP1 INQ-01/02/04, DASH-02 · PP2 INQ-03/05, LST-04, DASH-03, IOS-04 · PP3 OPP-03, AUTH-03, CNS-01/02, HELP-02 · PP4 OPP-02, LST-02 · PP5 LST-02/03, ADM-01, A11Y-02 · PP6 DISC-02/03/04/05/06 · PP7 AUTH-01/02/04, LST-01/06, CNS-03 · PP8 OPP-01, DISC-03, IOS-01 · PP9 DISC-01 · PP10 SRV-01/02/03, OPP-05 · PP11 HELP-01 · PP12 LRN-01/02, OPP-05 · PP13 DASH-01/02/05, INQ-04 · PP14 LST-06, DASH-04/06, CNS-04 · PP15 IOS-01, A11Y-04, DISC-04 (filter sheet on mobile). All 15 are covered by at least one MVP story.

---

## 5. Out of scope for the pitch

- **Payments:** consultation fees, service checkout, featured-placement purchase, listing fees, escrow and commission collection. Fees and terms are **displayed** only.
- **Real KYC and identity:** live Nafath integration, real SMS OTP, CR or licence verification against Wathq/MoC, AML checks. All mocked with a "تجريبي" label.
- **Admin console:** moderation queue, user management, featured-listing management, analytics, commission reconciliation, deal registration and invoicing. Only the user-facing effects appear (US-ADM-01).
- **Legally binding e-signature:** the NDA flow is a UX mock. A real version needs a qualified e-signature provider and a reviewed NDA template.
- **Backend and real data:** no access to `api.forsh.sa`. All data is dummy from `@forsa/data`, state is in memory or local storage, and there is no cross-device sync.
- **Real file storage, the document watermarking service and virus scanning** for confidential uploads.
- **Production push infrastructure** (APNs keys, server triggers). Local notifications only.
- **In-app chat / messaging** between buyer and seller beyond the inquiry message. The pipeline status carries the conversation in the pitch.
- **Reviews and ratings submission** for consultants and providers. Display rules only.
- **Android app, App Store submission, SEO migration and redirects** from the current URLs, and full analytics or attribution.
