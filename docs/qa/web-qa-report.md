# Web QA report: فرصة وتمكين redesign (apps/web)

Independent QA pass, 2026-11-03. Build served from `apps/web/out` (static export) on `localhost:4173`, driven with headless Chrome 153 via playwright-core. Remote images from `api.forsh.sa` are blocked in this sandbox. That is expected and is not counted as a defect.

## Verdict: **Not pitch-ready yet. One P0 to fix (about 15 minutes), then yes.**

The core demo works end to end in Arabic RTL:

- search, type control, filters, sort and map view
- detail page, then auth gated at the moment of action, then inquiry, NDA e-sign, OTP and success, then the request appears in the dashboard pipeline
- add wizard, then commission agreement, then auth, then publish, then the listing appears in the dashboard
- consultant slot, then auth, then confirm, then the booking appears in dashboard requests
- language toggle flips `dir`/`lang` and persists after reload

The build and type-check are clean, there are no broken internal links and no horizontal scroll. The blocker: with **Reduce Motion** turned on, the whole home hero (H1, the 2.47 مليار ر.س counter, search and CTAs) stays invisible. Many Macs and iPhones in a meeting room have Reduce Motion on.

| Priority | Count |
|---|---|
| P0 (blocks pitch) | 1 |
| P1 (visible flaw) | 5 |
| P2 (polish) | 10 |

## Build and type-check

| Check | Result |
|---|---|
| `npm run build -w @forsa/web` | Pass. Next 15.5.28, 86 static pages, no warnings. First-load JS 103 kB shared, 216 kB on `/` |
| `npx tsc --noEmit -p apps/web` | Pass, exit 0, no errors |

## Coverage

- **Routes (17):**
  - `/`, `/opportunities/`, `/opportunities/1124/`
  - `/add/`, `/dashboard/`
  - `/services/`, `/services/2/`
  - `/consultants/`, `/consultants/1/`
  - `/culture-center/`, `/articles/`, `/articles/buy/`
  - `/about/`, `/faq/`, `/contact/`, `/login/`
  - 404 (`/does-not-exist/`)
- **Variants per route:**
  - 1440x900 and 390x844
  - ar/en
  - light/dark
  - reduced motion (ar light, both viewports)
  - 170 page loads in total, each with a full-page and an above-the-fold PNG
- **Screenshots** are in `docs/qa/screens/` and named `<route>_<d|m>_<ar|en>_<light|dark>[_rm][_fold].png`.
- **Flow captures:** `flow_*.png`, `kbd_*.png` and `typestory_*.png`.

## Defects

### P0: blocks the pitch

**P0-1. Home hero is blank under `prefers-reduced-motion: reduce`**

| Field | Detail |
|---|---|
| Route | `/` |
| Viewport | Both |
| Locale | Both |
| Steps | Turn on Reduce Motion in the OS (Playwright `reducedMotion: 'reduce'`), then load `/` and wait 8 s. |
| Expected | US-A11Y-03 and design system §8: the counter shows its final value and the content is fully visible. |
| Actual | The H1 "فرصتك على بعد خطوة", the counter, the user/opportunity stats, the search field and both CTAs all stay at `opacity: 0`. Only the nav, aurora and skyline render. The computed H1 opacity is 0 at 0.5 s, 3 s and 8 s. |
| Screenshots | `home_d_ar_light_rm_fold.png`, `home_m_ar_light_rm_fold.png`, `hero_rm_after8s_reduce.png`, compared with `hero_rm_after8s_no-preference.png` |
| Likely cause | `src/components/wow/HeroCounter.tsx`, function `enter()` (around line 203). The server renders with `reduce=false`, so the elements get inline `opacity:0; transform:translateY(18px)`. On the client, `reduce` becomes true and `enter()` returns `{ initial: false }` with no `animate`, so motion never animates the inline opacity:0 away. |
| Fix | In the reduce branch, return `{ initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }`, or always return `animate` and set the duration to 0 when `reduce` is true. |

### P1: visible flaws

**P1-1. React hydration error #418 on every page in dark mode**

| Field | Detail |
|---|---|
| Route | All |
| Viewport | Both |
| Locale | ar and en |
| Steps | Set the OS to dark (`colorScheme: 'dark'`), keep the theme on "system", load any page and open the console. |
| Expected | No console errors. |
| Actual | `Minified React error #418 (HTML)` page error on all 17 routes, in both locales and at both viewports, every time and in dark mode only. It is visible if anyone opens devtools, and React re-renders the tree on the client. |
| Screenshot | Any `*_dark.png`; the console log is in the QA script output |
| Likely cause | `src/components/layout/GlassNav.tsx:44`. `isDark` reads `window.matchMedia(...)` during render, so the server renders the Moon icon and the client renders the Sun icon. |
| Fix | Compute `isDark` in a `useEffect`/`useSyncExternalStore` with a server snapshot of `false`, or render both icons and toggle them with CSS. |

**P1-2. Secondary text fails WCAG AA contrast (3.44:1) across the site**

| Field | Detail |
|---|---|
| Route | All (sampled `/opportunities/`, `/`, `/opportunities/1124/`) |
| Viewport | Both |
| Locale | Both |
| Measured | `--fz-color-label-secondary: rgba(60,60,67,0.60)` on white gives **3.44:1**. Text at 12–19 px needs 4.5:1. |
| Elements affected | <ul><li>page lead text</li><li>segmented-control labels and counts</li><li>card metric labels (الحصة المعروضة، الفروع)</li><li>"السعر المطلوب" captions</li><li>view counts</li><li>filter-aside labels (من، إلى، region names)</li><li>"عرض الكل" link</li></ul> |
| Lighthouse | Flags `color-contrast` on every audited page (a11y 95–97). |
| Expected | Design system §3.6 requires body text of at least 4.5:1. |
| Screenshots | `opps_d_ar_light_fold.png`, `home_d_ar_light.png` |
| Likely file | `packages/tokens/src/index.ts` (label.secondary light). Raise the alpha to about 0.72, or use an opaque `#6B6B70` on white and `#F5F7FB`. Then re-check dark mode. |

**P1-3. A user can send an inquiry on their own listing**

| Field | Detail |
|---|---|
| Route | `/opportunities/1124/` |
| Viewport | Desktop |
| Locale | ar |
| Steps | As a guest, open 1124, tap "طلب تواصل", then sign in through the sheet. |
| Expected | After sign-in, the demo user owns 1124 (`DEMO_OWNED_OPPORTUNITIES = [1124]`). The CTA becomes "إدارة الفرصة" and no inquiry is started. |
| Actual | The `requireAuth` callback still opens the inquiry sheet. You can complete message, NDA and OTP on your own listing while the page behind shows "إدارة الفرصة". This is risky because 1124 is the obvious demo listing. |
| Screenshot | `flow_inq_otp.png` (the sheet is open over "إدارة الفرصة") |
| Likely file | `src/components/detail/DetailView.tsx:40` (`startInquiry`). Re-check `ownsOpportunity(o.id)` inside the callback, or route owners to `/dashboard/?tab=listings`. |

**P1-4. The wizard does not ask the type-specific fields from US-LST-02**

| Field | Detail |
|---|---|
| Route | `/add/` |
| Viewport | Desktop |
| Locale | ar |
| Steps | Choose "فرص استثمارية" (or "البحث عن شريك" / "مستثمر لفكرة") and go to "الأرقام". |
| Expected | <ul><li>Investment asks for use of funds and expected payback.</li><li>Partner asks for role sought, what I bring, proposed split and commitment.</li><li>Idea asks for team size and MVP/traction.</li><li>For sale asks for the reason for sale.</li></ul> |
| Actual | Every type gets the same set (`price, equity, revenue, margin, branches, employees`); the idea type only hides branches and employees. None of the type-specific fields exist (no i18n keys either). This is an MVP story, and the pitch narrative "the form asks only what fits your type" will not hold. |
| Screenshot | `flow_add_financials_investment.png` |
| Likely file | `src/components/add/AddWizard.tsx` (steps 1–2), `src/lib/i18n.ts` |

**P1-5. Small, unlabelled filler numbers in the TypeStory chapter**

| Field | Detail |
|---|---|
| Route | `/` |
| Viewport | Desktop |
| Locale | ar/en |
| Expected | Doc §11.2: each chapter slides in a real example listing and ends with "استعرض فرص للبيع ←". |
| Actual | Each chapter shows only a big count (6 / 5 / 11 / 9) for the 31 demo listings. The proof band just below says 389 for sale and 285 investment (from the August report). The two sets of numbers contradict each other on the same scroll, and there is no example listing and no per-chapter link. The story is a passive, non-clickable card, and on desktop the sticky stage is about 2,900 px of navy with a single card in it. |
| Screenshots | `typestory_d_2.png`, `typestory_d_6.png`, `home_d_ar_light.png` (navy band from 900–3,800 px) |
| Likely files | `src/components/wow/TypeStory.tsx`; `typeCounts()` in `src/lib/opportunity.ts`. Use the platform figures, or drop the counts, and add the example card and link. |

### P2: polish

1. **Hit targets under 44 px (Apple spec §9.2).** The filled/tinted/gray Buttons are fine (see below), but these other controls are not:

   | Control | Visual / hit size | Likely file |
   |---|---|---|
   | Segmented controls on `/opportunities` type, services categories, culture audience and "How it works" | 38 px high | `SegmentedControl.tsx` |
   | Grid/Map toggle | 30 px | `SegmentedControl.tsx` |
   | Footer links | 36 px | `Footer.tsx` |
   | Detail breadcrumbs | 32 px | `PageHeader.tsx` |
   | Theme toggle and mobile menu `IconButton` (md) | 34x34 with no hit-slop (`before:` has no `inset-y`) | `Button.tsx` `IconButton` |

2. **Search field focus ring is not the spec ring.** It uses a 2px box-shadow, while spec §9.3 calls for a 3px primary @50% ring with 2px offset. It is visible, but inconsistent with the buttons. Screenshot: `kbd_search_focus.png`.

3. **Type segmented control overflows at 390 px with no affordance.** "البحث عن ش…" / "Partne…" are clipped at the edge, with no fade or scroll hint. Screenshot: `opps_m_ar_light_fold.png`. Likely file: `ExploreView.tsx`.

4. **`<title>` stays Arabic in English mode.** For example, `opps_*_en` has the title "الفرص · فرصة وتمكين". The titles come from static metadata. Minor, but visible in the browser tab during an English demo.

5. **Leftover Latin text in Arabic mode:**
   - "NDA" on cards and badges: use "اتفاقية سرية", or keep it intentionally.
   - "Business Model", "SEO", "Excel", "IFRS" in the services data.
   - "Full Stack" in the consultants data.
   - "5XXXXXXXX" phone hint: consider "5xxxxxxxx" or "مثال: 512345678".

   The data items are acceptable as proper terms, but "Business Model" should read "نموذج العمل".

6. **Featured grid on home leaves an orphan gap** (5 cards in a 3-column grid). Screenshot: `home_d_ar_light.png` around y 4,900. Show 6 or 3.

7. **Saudi map outline is a rough blob.** It is recognisable but not geographically faithful (the Gulf coast and Qatar bump are missing). Screenshot: `home_d_ar_light.png` (map section). File: `src/components/wow/CityMap.tsx`.

8. **`/favicon.ico` is missing (404).** Lighthouse best-practices penalises the console error. Add `app/icon.png`/`favicon.ico`.

9. **Mobile performance on `/`:** Lighthouse mobile scores 58 (LCP 4.4 s, TBT 920 ms), against 98 on desktop. The hero motion and odometer hydrate heavily. This is acceptable for a pitch on a laptop, but worth trimming before showing it on a phone. Likely files: `HeroCounter.tsx` (90 odometer digit spans), aurora blur layers.

10. **Heading order.** Lighthouse flags an `h3` in the TypeStory mobile carousel with no `h2` before it. Give the section a visually-hidden `h2`.

## What passed

| Area | Result |
|---|---|
| Build / types | Clean, 86 pages exported |
| Internal links | 91 unique internal hrefs crawled across every `out/**/*.html`; **0 broken**. Every dynamic route in the source maps to a generated param set (`opportunities` 31, `services` 29, `consultants` 5, `articles` 6). |
| 404 | `/does-not-exist/` serves the styled Arabic 404 ("الصفحة غير موجودة", back-home CTA) in both locales |
| Horizontal scroll | None. `scrollWidth == clientWidth` on all 170 page loads |
| RTL | <ul><li>`dir=rtl lang=ar` by default.</li><li>The toggle flips to `ltr/en` and persists after reload (boot script, no flash).</li><li>The nav, breadcrumbs, the "عرض الكل ←" arrows (mirrored with `ltr:rotate-180`), the stepper, the story progress origin and the sheet layout all mirror correctly.</li><li>The OTP digits are forced LTR as intended.</li><li>No physical left/right misalignment found in the screenshots.</li></ul> |
| Hero counter | Shows **"2.47 مليار ر.س"** (visual and screen-reader text "إجمالي قيمة الفرص المدرجة: 2.47 مليار ر.س"); English shows "SAR 2.47 billion". The odometer digit reels are all `aria-hidden`. |
| TypeStory (normal motion) | The sticky card stays in place (`top` 212 px, height 520 throughout) and chapters advance 01 → 04 with scroll. No overlap with the next section (`typestory_d_exit.png`). **0 long tasks** during a wheel scroll through it. Under reduced motion it shows static chapters correctly. On mobile it becomes a snap carousel that starts at the RTL start edge. |
| Explore (S02) | <ul><li>Search "مطعم" narrows 31 → 3 and syncs `?q=`.</li><li>The type control narrows to 1 with `&type=for-sale`.</li><li>"Verified only" filter, sort (`&sort=priceAsc`) and map view (`&view=map`) all work.</li><li>Removable chips work.</li><li>Save search triggers the auth sheet for guests.</li></ul> |
| Inquiry (S03/S04) | <ul><li>Guest taps "طلب تواصل" and the auth sheet opens (gate at action).</li><li>Sign-in: phone, OTP, then name.</li><li>Returns to intent: the inquiry sheet opens directly.</li><li>Message → NDA: an empty sign shows validation, then the user signs.</li><li>OTP (Confirm stays disabled until 4 digits) → success "وصل طلبك إلى المالك".</li><li>"تابع من لوحتك" opens `/dashboard/?tab=pipeline` with "طلباتي المرسلة 1".</li><li>The detail CTA then becomes "عرض حالة طلبك".</li><li>Tested on 704; flow screenshots are `flow_inq_*`, `flow_dash_pipeline.png`.</li></ul> |
| Add wizard (S05) | <ul><li>Starts without login.</li><li>Required-field and price validation work.</li><li>Live card preview, review with per-section "تعديل".</li><li>The commission agreement is required (an error shows if it is unchecked).</li><li>Auth at publish, then the published screen ("قيد المراجعة — يحتاج تعديلًا" with quality flags).</li><li>The listing appears in `/dashboard/?tab=listings`.</li></ul> |
| Consultant booking (S10) | <ul><li>Day and slot radios; the CTA is disabled ("اختر موعدًا أولًا") until a slot is chosen.</li><li>Auth, then a confirm sheet (date, 30 min, 50 ر.س, non-refundable note), then "تم حجز جلستك".</li><li>The booking appears in dashboard requests as "مؤكد".</li></ul> |
| Dashboard (S06) | Pipeline columns جديد / الاتفاقية / اجتماع / مغلق with "نقل للمرحلة التالية" and "منح الوصول للمستندات". The guest state shows a sign-in card. |
| Buttons vs Apple spec | <ul><li>Every `Button` measured on 8 routes: md = **34 px**, radius 10, 17 px/700; lg = **50 px**, radius **12**, 17 px/700.</li><li>md hit-slop `::before` −5 px top and bottom, giving a 44 px hit area.</li><li>Pressed state: `scale 0.97` and `opacity 0.85`.</li><li>Disabled: **opacity 0.4**.</li><li>Focus: **3 px** solid `rgba(2,117,217,.5)`, offset 2 px (white @80% on the transparent hero nav).</li><li>Filled primary `#0275D9` with white text measures 4.62:1 (passes); dark mode `#4EA7DF` with black text measures 7.92:1.</li></ul> |
| Keyboard | <ul><li>The skip link is the first tab stop and is visible.</li><li>Tab order is logical, with a focus ring visible on every stop.</li><li>The sheet traps focus (10 of 10 tabs stayed inside).</li><li>Esc closes the sheet and returns focus to "طلب تواصل".</li></ul> |
| Brand | Primary `#0275D9`, navy band, sky `#4EA7DF` in dark mode, Tajawal for Arabic and Inter for Latin, wordmark logo (not the icon) in the nav and footer. |
| Copy | <ul><li>No lorem or placeholder text found.</li><li>The demo is honestly labelled: "تجريبي" tags and the footer concept disclaimer.</li><li>Hamza and taa marbuta are correct in the UI (the "إستثمارية" data label is normalised to "استثمارية").</li><li>"معتمد" is used correctly.</li><li>No Arabic typos found in the UI dictionary.</li></ul> |
| Console | No page errors in light mode on any route. The only console noise is the blocked `api.forsh.sa` images (expected) and the favicon 404. |

## Lighthouse (Chrome 153, local static server)

| Page | Preset | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/` | desktop | 98 | 95 | 96 | 63 | 1.1 s | 0 | 10 ms |
| `/` | mobile | 58 | 95 | 96 | 63 | 4.4 s | 0 | 920 ms |
| `/opportunities/1124/` | desktop | 100 | 96 | 96 | 60 | 0.2 s | 0 | 0 ms |
| `/opportunities/1124/` | mobile | 90 | 97 | 96 | 63 | 0.8 s | 0 | 400 ms |

- **SEO is low by design:** `robots: { index: false }` in `app/layout.tsx` fails `is-crawlable`, which is right for a private pitch.
- **Best practices** loses points for the blocked remote images and the favicon 404.
- **Accessibility** loses points for color contrast (P1-2) and heading order (P2-10).
