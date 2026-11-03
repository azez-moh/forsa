# Screen inventory (contract for stories, Figma and code)

Every story, Figma frame and route/screen uses these IDs. Web routes are Next.js App Router paths; iOS screens are Expo Router paths.

| ID | Screen | Web route | iOS (Expo Router) | Fixes pain point |
|---|---|---|---|---|
| S01 | Home: cinematic hero with live value counter, 4-type scroll story, featured, city map, how it works, trust/stats, services, consultants, culture center, final CTA | `/` | `(tabs)/index` (Discover) | Home undersells; no single CTA |
| S02 | Explore opportunities: keyword search, type segmented control, filter sheet (category, city, price range log-scale, stage, equity, verified), sort, grid/map toggle, save search | `/opportunities` | `(tabs)/opportunities` | Thin search |
| S03 | Opportunity detail: gallery, structured key metrics (price, equity %, revenue, margin, payback, branches, employees), verified owner + CR badge, posted date, inquiry CTA, NDA-gated docs, similar | `/opportunities/[id]` | `opportunity/[id]` | No contact, buried data, trust |
| S04 | Inquiry + NDA flow: intro message, investor profile, NDA e-sign, OTP confirm, success | modal on S03 | sheet `inquiry/[id]` | No NDA flow |
| S05 | Add opportunity wizard: type → basics → financials → media → review → published (card flies to dashboard) | `/add` | `(tabs)/add` | Heavy forms |
| S06 | Dashboard: my listings with stats, inquiry pipeline (new → NDA → meeting → closed), saved, service requests | `/dashboard` | `(tabs)/inbox` + `(tabs)/profile` | No owner dashboard |
| S07 | Services catalog with categories | `/services` | `services/index` | Services look unfinished |
| S08 | Service detail + request | `/services/[id]` | `services/[id]` | |
| S09 | Consultants list | `/consultants` | `consultants/index` | |
| S10 | Consultant profile + booking (slot picker) | `/consultants/[id]` | `consultants/[id]` | |
| S11 | Culture center: video categories, player, linked opportunities | `/culture-center` | `learn/index` | Content not linked to listings |
| S12 | Articles list + detail | `/articles`, `/articles/[slug]` | `learn/articles/[slug]` | |
| S13 | Auth: phone + OTP, Nafath (mocked), role picker onboarding; gate only at the moment of action | `/login` (sheet) | `auth/*` | Login wall |
| S14 | About, FAQ, Contact | `/about`, `/faq`, `/contact` | `profile/about`, `profile/faq` | Broken nav, FAQ answers |

iOS tab bar: Discover · Opportunities · Add (+) · Inbox · Profile. Floating glass tab bar, large titles collapsing into a glass nav bar.

## Shared rules
- Data from `@forsa/data`, tokens from `@forsa/tokens`. No hard-coded brand hex.
- Arabic first (RTL, `dir="rtl"`), English toggle. Tajawal on web, system font (SF Arabic) on iOS.
- Buttons follow the Apple spec in `docs/02-design-system.md`.
- Auth and inquiry are mocked client-side (no backend). State in memory or local storage.
