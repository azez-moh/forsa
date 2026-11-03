> **Brand verified (Nov 2026)** from forsh.sa computed styles: primary `#0275D9`, navy `#17234F`, sky `#4EA7DF`, warm highlight `#FF9F43`, font **Tajawal** (kept for brand continuity; Inter for Latin). Earlier emerald/gold and IBM Plex values in this document are superseded; `packages/tokens` is the source of truth.

# 02 — Design System: فرصة وتمكين (Forsa w Tamkeen)

Apple-grade (HIG-aligned), Arabic-first (RTL), bilingual with English.
Machine-readable tokens: `packages/tokens/src/index.ts` (`@forsa/tokens`).

---

## 0. Status of brand values — read first

| Item | Status |
|---|---|
| Logo files | Located, **not downloaded**. `https://forsh.sa/_next/static/media/logo.b519c833.png` (light) and `https://forsh.sa/_next/static/media/logo-dark.59305712.png` (dark). The sandbox proxy blocks forsh.sa (HTTP 403) and the fetch tool could not retrieve the PNGs. |
| Exact hex colors | **Not extracted.** The rendered HTML exposes no CSS bundle links, no `theme-color`, no inline styles and no CSS variables to the fetch tool. |
| Brand fonts | **Not identified.** Only a `next-size-adjust` meta tag, so the site uses `next/font`, but the family name isn't exposed. |

**Consequence:** the brand primary and accent values below are **provisional** and marked `PROVISIONAL`. They are kept in one object (`brandSource` in the tokens file). Before the pitch, open the two logo PNGs, use an eyedropper to get the real values, and replace `brandSource`. Every derived ramp (tints, dark mode, tinted buttons) is built from those two inputs, so nothing else changes.

---

## 1. Brand audit (from forsh.sa, Nov 2026)

### What exists
- **Positioning.** "فرصتك على بعد خطوة" / OG title "فرصة - مشروعك التجاري على بعد خطوة". A Saudi marketplace for businesses for sale, investment, partner search and investor search, plus paid business services and a network of consultants.
- **IA (nav).** الرئيسية · الفرص · الخدمات · المستشارون · مركز الثقافة والأعمال · المصادر · عن فرصة وتمكين.
- **Hero CTAs.** إضافة فرصة · طلب استشارة · طلب خدمة. Three equal-weight CTAs, so no primary action.
- **Four opportunity types** (URL `type` param): فرص للبيع (1), فرص إستثمارية (2), البحث عن شريك (5), البحث عن مستثمر لفكرة أو مشروع (6).
- **Filters.** Type, category (تقني، تجاري، صناعي، خدمي، تغذية), 17 cities, price 0–300M SAR, sort.
- **Card fields.** Title, description, price, city, category, type label, "عرض الفرصة".
- **Example listings.** 750K to 9.5M SAR across Riyadh, Dammam and Jazan.
- **Services.** 16 first-party services (feasibility studies, investment file, brand identity, legal structuring, SEO, paid ads…) plus provider listings (legal, accounting, notarisation).
- **Two logo variants** (light and dark) exist, so a basic theme awareness is already there.

### What's weak
1. **No visible hierarchy of intent.** Three co-equal hero CTAs split attention. Buyers, sellers and investors all land in the same funnel.
2. **Unlabelled numbers.** Cards show figures like "14235/2" and "20256/5" with no label. They read as noise and erode trust on a money platform.
3. **No proof layer.** No aggregate value, deal count, or verification signal above the fold. The single strongest trust asset (total opportunity value) is not surfaced.
4. **Inconsistent spelling and labels.** For example "إستثمارية" vs "استثمارية", "جده" / "مكه" without taa marbuta, and "الاجراءات الادارية" without hamza. A premium brand needs an editorial standard.
5. **No visible token system.** No `theme-color` and no CSS variables, which suggests ad-hoc styling and no dark-mode parity beyond the logo swap.
6. **Services and opportunities compete.** 24 service items render in a flat list, with no grouping by journey stage (idea, establish, grow, exit).
7. **Legal disclaimer buried.** "Consultations are not certified legal opinions" is shown in a list item, not in a structured trust/compliance pattern.

### What we keep
- The name, both logo lockups, the wordmark, and the core brand colors (once verified).
- The four opportunity types. These become the backbone of the new IA and story.
- The tagline idea "على بعد خطوة". This becomes the motion metaphor: one step, one transition.

---

## 2. Principles

1. **Clarity over decoration.** Content first. Chrome recedes, as with iOS bars that blur instead of block.
2. **Deference.** Numbers and opportunities are the hero. The UI is quiet glass and neutral grey.
3. **Depth with restraint.** Layering, translucency and motion explain hierarchy. They are never ornament.
4. **Arabic-first, not Arabic-translated.** Layout is designed in RTL. English is the mirrored variant. Wording is native business Arabic, not literal translation.
5. **Trust is a visual property.** Every number is labelled, every figure is formatted, and every claim has a source.

---

## 3. Color

### 3.1 Brand source (single point of truth)
| Token | Value | Status |
|---|---|---|
| `brand.primary` | `#0E5A4F` (deep emerald) | **PROVISIONAL. Replace with the logo's primary.** |
| `brand.accent` | `#C8A15A` (desert sand-gold) | **PROVISIONAL. Replace with the logo's secondary.** |

Rationale for the provisional pair: a deep emerald reads as Saudi, financial and calm. Sand-gold signals value without the cliché of bright gold. If the real logo is, for example, navy plus orange, swap the two values and keep every rule below.

### 3.2 Brand ramps (light and dark)
- `primary`. Light `#0E5A4F`, dark `#3FB8A0` (lifted for contrast on near-black, as Apple does with systemBlue).
- `primaryTint` (tinted-button fill). Light is primary at 12% opacity, `rgba(14,90,79,0.12)`. Dark is `rgba(63,184,160,0.18)`.
- `accent`. Light `#B08A42` for text-safe usage and `#C8A15A` for fills. Dark `#E0BE7C`.
- Use accent sparingly: value highlights, the live counter, and the verified badge. It is never used for chips, steps or large fills.

### 3.3 Neutrals (Apple system greys, slightly warmed toward sand)
| Role | Light | Dark |
|---|---|---|
| `bg.primary` | `#FFFFFF` | `#000000` |
| `bg.secondary` (grouped) | `#F5F5F2` | `#1C1C1E` |
| `bg.tertiary` | `#FFFFFF` | `#2C2C2E` |
| `bg.elevated` | `#FFFFFF` | `#1C1C1E` |
| `fill.primary` | `rgba(120,120,128,0.20)` | `rgba(120,120,128,0.36)` |
| `fill.secondary` | `rgba(120,120,128,0.16)` | `rgba(120,120,128,0.32)` |
| `fill.tertiary` | `rgba(118,118,128,0.12)` | `rgba(118,118,128,0.24)` |
| `label.primary` | `#000000` / web `#111111` | `#FFFFFF` |
| `label.secondary` | `rgba(60,60,67,0.60)` | `rgba(235,235,245,0.60)` |
| `label.tertiary` | `rgba(60,60,67,0.30)` | `rgba(235,235,245,0.30)` |
| `separator` | `rgba(60,60,67,0.29)` | `rgba(84,84,88,0.65)` |
| `separator.opaque` | `#C6C6C8` | `#38383A` |
| `material.bar` (glass) | `rgba(250,250,248,0.72)` + blur 20 + saturate 180% | `rgba(22,22,24,0.72)` + blur 20 + saturate 180% |

### 3.4 Semantic (Apple system values)
| Role | Light | Dark | Use |
|---|---|---|---|
| `success` | `#34C759` | `#30D158` | Deal closed, verified, completed |
| `warning` | `#FF9500` | `#FF9F0A` | Pending review, expiring |
| `danger` | `#FF3B30` | `#FF453A` | Destructive, errors |
| `info` | `#007AFF` | `#0A84FF` | Neutral notices, links in system contexts |

### 3.5 Opportunity-type hues (categorical, low saturation)
Used only as a 6–8pt dot or a thin underline, never as large fills.
- للبيع (For sale): `#0E5A4F` (primary)
- استثمارية (Investment): `#C8A15A` (accent)
- شريك (Partner): `#5E6AD2` (indigo)
- مستثمر لفكرة (Investor for an idea): `#B5577A` (rose)

### 3.6 Contrast rules
- Body text is at least 4.5:1 and large text (20pt and up, or 17 semibold) at least 3:1. Check provisional values again after the real brand hex is swapped in.
- White on `primary` must pass 4.5:1. If the real brand primary is light (for example a bright orange), filled buttons switch to `label.onPrimary = #000`, or use a darker `primary.strong` step.

---

## 4. Typography

### 4.1 Families
| Platform | Arabic | Latin | Numerals |
|---|---|---|---|
| iOS / macOS | **SF Arabic** (system) | **SF Pro** (system, Text ≤19pt, Display ≥20pt automatic) | SF Pro, tabular for prices |
| Web | **IBM Plex Sans Arabic** (Google Fonts, 100–700) | **IBM Plex Sans** (shared metrics with the Arabic cut) | IBM Plex Sans with `font-variant-numeric: tabular-nums` |
| Web fallback stack | `"IBM Plex Sans Arabic", "SF Arabic", "Geeza Pro", "Noto Sans Arabic", system-ui, sans-serif` | `"IBM Plex Sans", -apple-system, "SF Pro Text", system-ui, sans-serif` | |

Why Plex: it has a true matched Arabic/Latin superfamily, neutral corporate tone, and good hinting. It is open (OFL) and sits close to SF in feel. Alternative if the brand wants more warmth: **Readex Pro** (single family covering both scripts).

**Numerals:** Western Arabic digits (0–9) for prices and figures in both languages. This is standard for Saudi finance UIs and avoids mixed-digit bugs. Currency format: `2.47 مليار ر.س` / `SAR 2.47B`. Use the new Saudi Riyal symbol glyph where the font supports it, with `ر.س` as fallback.

### 4.2 Scale (mirrors Apple Dynamic Type, "Large" default)
| Style | Size / Line height | Weight | Arabic adj. |
|---|---|---|---|
| Large Title | 34 / 41 | Bold (700) | line-height +12% |
| Title 1 | 28 / 34 | Bold (700) | +12% |
| Title 2 | 22 / 28 | Bold (700) | +12% |
| Title 3 | 20 / 25 | Semibold (600) | +12% |
| Headline | 17 / 22 | Semibold (600) | +15% |
| Body | 17 / 22 | Regular (400) | +18% (≈ 26) |
| Callout | 16 / 21 | Regular (400) | +18% |
| Subhead | 15 / 20 | Regular (400) | +18% |
| Footnote | 13 / 18 | Regular (400) | +15% |
| Caption 1 | 12 / 16 | Regular (400) | +15% |
| Caption 2 | 11 / 13 | Regular (400) | +15% |

Web display sizes for marketing only: Display XL 72/76, Display L 56/60, Display M 44/48, all Bold with tracking −0.02em for Latin only.

Rules:
- **Arabic tracking is always 0.** Never letterspace Arabic, because it breaks joining. Negative tracking applies only to Latin display sizes.
- Arabic needs about 12–18% more line height than Latin at the same size, because of ascenders, descenders and dots.
- Tashkeel only where it prevents ambiguity.
- Max measure: 68 characters for Latin, about 60 for Arabic.

---

## 5. Spacing — 8pt grid
`0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128`. 4 and 2 are allowed only for optical tweaks inside components.

- Screen margins. iOS 16 (compact) / 20 (regular). Web 20 (mobile), 32 (tablet), 64 (desktop). Max content width 1200, with reading columns at 720.
- Section rhythm (web). 96–128 between sections on desktop and 64 on mobile.
- Use **logical properties** throughout (`padding-inline-start`, `margin-inline-end`, `inset-inline`). Never use left/right. Icons with direction (chevrons, arrows) mirror in RTL. Media controls and number lines don't.

---

## 6. Radii (continuous corners)
| Token | Value | Use |
|---|---|---|
| `xs` | 6 | Tags, badges |
| `sm` | 8 | Inputs (compact), small buttons |
| `md` | 12 | **Buttons**, inputs, list cells |
| `lg` | 16 | Cards |
| `xl` | 22 | Sheets, modals, large media |
| `2xl` | 28 | Hero cards, feature panels |
| `full` | 9999 | Capsule buttons, avatars, segmented control |

iOS uses `.continuous` corner style. Web approximates it with `border-radius` plus an optional SVG squircle mask on hero cards only.

---

## 7. Elevation (subtle — prefer material/blur over shadow)
| Level | Light | Dark |
|---|---|---|
| `0` flat | none | none |
| `1` card | `0 1px 2px rgba(0,0,0,.04), 0 1px 1px rgba(0,0,0,.03)` | none; use `bg.tertiary` + 0.5px separator |
| `2` raised (hover) | `0 4px 16px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04)` | `0 0 0 0.5px rgba(255,255,255,.08)` |
| `3` overlay (menus, popovers) | `0 12px 40px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06)` | `0 12px 40px rgba(0,0,0,.5)` |
| `4` modal/sheet | `0 24px 64px rgba(0,0,0,.18)` | `0 24px 64px rgba(0,0,0,.6)` |

---

## 8. Motion
| Token | Value | Use |
|---|---|---|
| `duration.instant` | 100ms | Press feedback |
| `duration.fast` | 200ms | Hover, toggles, small fades |
| `duration.base` | 300ms | Most transitions |
| `duration.slow` | 450ms | Sheets, page transitions |
| `duration.cinematic` | 800–1200ms | Hero counter, story reveals (once only) |
| `ease.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default |
| `ease.decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Entering |
| `ease.accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | Exiting |
| `spring.default` | response 0.5, damping 0.825 (SwiftUI `.smooth`) | Cards, layout |
| `spring.snappy` | response 0.35, damping 0.85 (`.snappy`) | Buttons, toggles |
| `spring.bouncy` | response 0.5, damping 0.7 (`.bouncy`) | Celebratory only (deal submitted) |

Web springs are expressed as Framer Motion `{type:"spring", stiffness, damping, mass}` equivalents in the token file.
- `prefers-reduced-motion`: replace all transforms with 150ms opacity crossfades. Turn off parallax, magnetic and counter animation. The counter shows its final value.
- RTL: horizontal slide direction mirrors, so "forward" moves toward the left in Arabic.

---

## 9. Buttons (Apple standard)

### 9.1 Styles
| Style | Fill | Label | Use |
|---|---|---|---|
| **Filled** | `primary` | `#FFFFFF` (onPrimary) | One primary action per view, for example "أضف فرصتك" |
| **Tinted** | `primaryTint` (primary @12% light / 18% dark) | `primary` | Secondary emphasis, for example "طلب استشارة" |
| **Gray** | `fill.tertiary` | `label.primary` | Neutral or tertiary actions, for example "حفظ", "مشاركة" |
| **Plain** | transparent | `primary` | Inline / text links, toolbar actions |
| **Destructive** | `danger` (filled) or `danger` @12% (tinted) | `#FFFFFF` / `danger` | Delete listing, withdraw offer |

### 9.2 Sizes
| Size | Height | Padding-inline | Label | Radius | Hit target |
|---|---|---|---|---|---|
| Small | 28 (visual) | 12 | Subhead 15 semibold | 8 or capsule | **44×44 min** via invisible hit-slop |
| Medium | 34 | 16 | Body 17 semibold (iOS 15 on compact) | 10 | 44×44 min |
| Large | **50** | 20 | **Body 17 semibold** | **12** | 50 × full width on mobile |

### 9.3 States
| State | Treatment |
|---|---|
| Default | As above |
| Hover (web) | Filled: +6% black overlay. Tinted/gray: fill +4% opacity. Plain: 0.8 opacity |
| Pressed | **scale 0.97** + opacity 0.85, `spring.snappy`, 100ms in, spring out |
| Disabled | **40% opacity**, no pointer events, no hover |
| Loading | Label crossfades to a 17pt activity indicator. Width is locked to prevent layout shift |
| Focus (web) | `outline: 3px solid primary @ 50%`, `outline-offset: 2px`, on `:focus-visible` only. Same radius as the button |

Icon + label: 8pt gap, icon 17pt and SF Symbol weight matched to label. In RTL the leading icon sits at the right.

---

## 10. Core components (summary)
- **Navigation bar (glass).** 52 high on web and 44 + large title on iOS. Material `bar`, 0.5px bottom hairline appears only after scroll. Wordmark logo (not the icon) at the inline-start. One filled CTA "أضف فرصة" at the inline-end, with secondary items in a plain style.
- **Opportunity card.** Radius 16. Media 16:10. Type dot plus label. Title in Headline. City · category in Subhead secondary. **Price in Title 3 tabular**. Every number is labelled, for example "مشاهدات 1,120", never a bare figure. Hover lifts to elevation 2 and the image scales to 1.03.
- **Segmented control** for the 4 types: capsule, `fill.tertiary` track, white or elevated thumb with a spring.
- **Inputs.** Height 44 (iOS) and 48 (web), radius 12, `fill.tertiary` background, no border until focus.
- **Sheet / modal.** Radius 22 top corners, grabber 36×5.
- **Badges.** "موثّقة" (verified) uses `success`. "جديدة" (new) uses `primaryTint`.

---

## 11. Wow factor — signature moments (restrained)

Guiding rule: **one cinematic moment per screen, everything else quiet.** Motion always explains: where something came from, what's live, and what's next. None of these is decorative only, and all degrade gracefully under `prefers-reduced-motion`.

1. **Cinematic hero with a live value counter.**
   Full-bleed, near-white (or true black in dark mode) canvas. One line of Display XL: "فرصتك على بعد خطوة". Below it, a single figure counts up once on load in tabular numerals: **"2.47 مليار ر.س"**, labelled "قيمة الفرص المعروضة على المنصة". The digits roll like an odometer, about 1.2s, decelerating. Accent gold is used only on the currency unit. The live figure ticks quietly when a new listing is published, with a soft 300ms digit roll. One filled CTA and one tinted CTA. Replace placeholder figures with verified platform data before launch.

2. **Scroll-driven story of the four opportunity types.**
   A sticky stage with four chapters: للبيع → استثمارية → شريك → مستثمر لفكرة. As you scroll, a single card morphs between states. The type dot changes hue, the headline crossfades, and one real example listing slides in from the inline-start edge. Progress is shown as four thin segments on the side, like iOS story progress. Each chapter ends with a plain link "استعرض فرص للبيع ←".

3. **Saudi map with glowing opportunity density.**
   A minimal vector outline of the Kingdom on `bg.secondary`. Cities appear as soft radial glows sized by opportunity count and value, using primary at varying opacity with no heat-map rainbow. Hovering or tapping a city shows a glass popover: "الرياض · 128 فرصة · 1.2 مليار ر.س". Glows breathe very slowly (4s, ±6% opacity). The map is static under reduced motion.

4. **Magnetic, parallax opportunity cards.**
   On desktop pointer devices only, cards tilt at most 3° toward the cursor and the media layer shifts 6–8px for depth, like iOS home-screen parallax. The CTA inside the card is gently magnetic within 12px. No tilt on touch. A specular highlight sweeps across the card on hover with very low opacity.

5. **Shared-element transition: card → detail.**
   Tapping a card expands its image, title and price into the detail page header in one continuous spring (`spring.default`, about 450ms), as with the App Store "Today" cards. Uses the View Transitions API on web and `matchedGeometryEffect` on iOS. Back reverses it exactly. The detail sheet's content fades up 8pt after the morph settles.

6. **Glass navigation and tab bar (iOS material).**
   The nav bar is transparent over the hero and becomes frosted glass with a hairline after 8px of scroll. The large title collapses into an inline title with a scroll-linked crossfade, exactly as UIKit large titles do. On mobile web, a floating glass capsule tab bar holds 4 items: الفرص · الخدمات · المستشارون · حسابي.

7. **"One step" submission flow.**
   Adding an opportunity is a single sheet with a stepper. Each step slides in with a spring, and the progress capsule fills as the user advances. On submit, the card they just created flies from the sheet into the "فرصي" list. This is the one place `spring.bouncy` is allowed, and it pairs with a single success haptic on iOS. It makes the tagline "على بعد خطوة" literal.

Explicitly **not** doing: particle backgrounds, autoplay video heroes, gradient blobs, cursor trails, scroll-jacking that blocks reading, or gold used as a large surface.

---

## 12. Bilingual / RTL rules
- `<html dir="rtl" lang="ar">` is the default. The English route sets `dir="ltr" lang="en"`, and both are served from the same component tree using logical CSS.
- Mixed content: wrap Latin brand names and numbers in `<bdi>` to prevent bidi reordering, for example prices and phone numbers.
- Mirror directional icons (chevrons, back arrows, progress). Don't mirror logos, media controls, charts' time axes (optional), or checkmarks.
- Copy standard: one editorial Arabic style sheet. Use correct hamza and taa marbuta ("استثمارية", "جدة", "مكة", "الإجراءات الإدارية"), and use "معتمد" for certified/accredited.
- Use the wordmark logo (with name) in nav and footer, never the isolated icon in primary placements.

---

## 13. Handoff checklist
- [ ] Replace `brandSource.primary` / `brandSource.accent` with eyedropped logo values, then re-run contrast checks.
- [ ] Download both logo PNGs, and ask the client for vector (SVG/AI) masters.
- [ ] Confirm the platform total value used in the hero counter, and its source and date.
- [ ] Load IBM Plex Sans Arabic and IBM Plex Sans via `next/font/google`, subset to `arabic` and `latin`.
