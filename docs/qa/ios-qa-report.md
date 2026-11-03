# iOS app QA report (`@forsa/ios`)

Reviewer: independent QA (did not build the app) · Date: 2026-11-03
Scope: `apps/ios` (Expo SDK 58, Expo Router 58, RN 0.88.1, React 19.3.0). Requirements: `docs/03-screen-inventory.md`, `docs/04-user-stories.md` (IOS, INQ, LST, AUTH, A11Y), `docs/02-design-system.md`.
Method: typecheck, iOS export, a temporary web render in a scratch copy (the repo was not modified), and a line-by-line code review of every route and component. No simulator or device was available.

---

## Verdict

**Not pitch-ready as-is. Two P0 defects must be fixed first.** Both have small, local fixes, and the rest of the app is solid.

1. **Every opportunity card crashes in Expo Go (dev) and loses its styling in release builds** (P0-1). Discover is the first tab and has a featured strip, so in Expo Go the app opens on an error screen. Opportunities, the detail page's "similar" strip and Profile → محفوظاتي are also affected. This was reproduced in the web render and traced to expo-router's `Slot` code.
2. **The first launch of a native Release or TestFlight build stays on the splash screen** on any iPhone whose language is not Arabic. The language switch's "Restart now" also does nothing in those builds (P0-2).

After these two fixes, the app is pitch-ready **for the Expo Go path (README Option A)**, once these are checked on a real iPhone:

- The first-launch RTL reload in Expo Go happens once and the UI comes up right-to-left: tab order, back swipe from the right edge, chevrons pointing left.
- Face ID prompt → document viewer with watermark → the blur in the app switcher (snapshot timing).
- The card → detail zoom transition (iOS 18+).
- A formSheet over a formSheet (inquiry → auth) and the RN `Modal` that opens right after the auth sheet closes (services request, P1-6).
- Dynamic Type at AX sizes (P1-5) and the truncation in the 4- and 5-segment controls (P2).
- Swipe direction of the inbox pipeline rows in RTL.
- `Intl` compact notation and `ar-SA` date output on Hermes.
- Light and dark mode.

### Counts

| Priority | Count |
|---|---|
| P0 | 2 |
| P1 | 7 |
| P2 | 22 |

---

## 1. Build checks

| Check | Result |
|---|---|
| `npx tsc --noEmit -p apps/ios` (repo root) | **Pass**: 0 errors (6.7 s) |
| `npx expo export --platform ios --output-dir <scratch>` | **Pass**: 1,765 modules, Hermes bytecode bundle 4.3 MB, 23 assets |
| Dependency versions vs `expo/bundledNativeModules.json` (SDK 58) | **Pass**: all 26 native deps match exactly (`expo install --check` could not reach the network, so this was compared offline) |
| `npx expo-doctor` | Not run (needs network) |

## 2. Web render (visual smoke test)

- **Setup.** I copied `apps/ios` into the scratchpad and temporarily added `react-native-web@0.21.4` and `react-dom@19.3.0` there. The only change to the copy's metro config was the paths. I then ran `expo export --platform web`, served the output, and used headless Chrome (Playwright) at 402×874 @2x.
- **Rendered fine (10 of 13 routes):** `/inquiry/1124`, `/listing/new`, `/inbox` (guest), `/profile` (guest), `/auth`, `/services`, `/consultants`, `/learn`, `/faq`, `/about`.
- **Crashed (3 of 13):** `/` (Discover), `/opportunities` and `/opportunity/1124`, all with `TypeError: Failed to set an indexed property [0] on 'CSSStyleDeclaration'`.
- **Bisect.** Removing `Link.AppleZoom` did not help. Replacing `<Link asChild>` in `OpportunityCard` with a plain `router.push` fixed all three routes. This is P0-1.
- **Native-only fallbacks, as expected:**
  - SF Symbols render as text glyphs or "•".
  - The blur is a flat tint.
  - Haptics, Face ID, `ActionSheetIOS` and `Alert.prompt` were not exercised.
  - The large-title header overlaps content on web (a web-only artifact).
- **What I saw in the screenshots:**
  - Arabic RTL layout, type scale and chips look right.
  - The hero counter reads "2.47 مليار ر.س" and the price in words reads "مليون وخمسمئة ألف ريال".
  - Locked metrics show "متاح بعد اتفاقية عدم الإفصاح" (never 0).
  - The sticky CTA bar and the glass tab bar with the center + render correctly.
  - The inbox badge "2" shows while signed out.
  - Long segment labels wrap or truncate (see P2).
- **Screenshots:** `/tmp/claude-0/-home-claude/eafa61d5-755b-5cdc-8d8f-30f6c3f5982e/scratchpad/ios-qa/shots/` (temporary scratch files).

---

## 3. Defects

### P0: must fix before any demo

**P0-1 · Opportunity cards crash in Expo Go and lose their styling in release builds**
`apps/ios/src/components/OpportunityCard.tsx:44-49`
- **What's wrong.** `<Link … asChild>` wraps `<ScalePressable style={[styles.card, { backgroundColor: c.card, width }]}>`, which is an **array** style. With `asChild`, expo-router renders its `Slot` (`node_modules/expo-router/build/ui/Slot.js`):
  - In dev (`NODE_ENV !== 'production'`, which includes **Expo Go**), it throws `"[expo-router]: You are passing an array of styles to a child of <Slot>…"`.
  - In production, Radix `mergeProps` does `{...slotStyle, ...childStyle}`, which spreads the array into `{0: …, 1: …}`. On web that crashes (reproduced). On native the card's radius, background, width and overflow are silently dropped.
- **Why it matters.** Discover (the first screen), Opportunities, the detail page's similar strip, Profile → محفوظاتي and the article's related strip all render this card. Demo step 1 in the README is to tap a featured card.
- **Fix.** Pass a flat style:
  ```tsx
  style={StyleSheet.flatten([styles.card, { backgroundColor: c.card, width }])}
  ```
  Or wrap the `ScalePressable` in a `View` that has no array style. Grep for any other `asChild` children before re-testing.

**P0-2 · Release/TestFlight builds: first launch stays on the splash; "Restart now" does nothing**
`apps/ios/src/lib/reload.ts:13-25`, `apps/ios/src/app/_layout.tsx:32-40`, `apps/ios/app.json` (no `updates` config)
- **What's wrong.** `applyDirection` only calls `Updates.reloadAsync()` when `Updates.isEnabled`. `app.json` has no `updates.url`, so expo-updates runs its `DisabledAppController` and `isEnabled` is `false`. The code then falls through to `DevSettings.reload()`. In release builds that is a **no-op that does not throw** (`Libraries/Utilities/DevSettings.js`), so the function returns `true`.
  - `_layout.tsx` hides the splash only when `ok === false`. On any device whose language is not Arabic, the first launch of a Release/TestFlight build stays on the splash until the user kills the app.
  - Profile → اللغة → "Restart now" silently does nothing, and the "restart manually" fallback never shows.
- **Why it matters.** README Options B (Release) and C (TestFlight) are the paths that show the real Arabic Face ID text and home-screen name. A frozen splash in front of the Forsa team ends the pitch.
- **Fix.** Drop the `Updates.isEnabled` guard:
  - `DisabledAppController.requestRelaunch` still recreates the React context, so `Updates.reloadAsync()` works in release builds without an update URL.
  - Keep `DevSettings.reload()` for `__DEV__` only, and return `false` when neither path applies.
  - Also call `SplashScreen.hideAsync()` on a timeout (for example 3 s) as a safety net.

### P1: fix before the pitch, or confirm on a device

**P1-1 · Demo listing #1124 is featured and also "owned" by whoever signs in**
`apps/ios/src/store/app.ts:19,297-298`, `apps/ios/src/app/opportunity/[id].tsx:109,141-145`, `apps/ios/README.md:85-88`
- **What's wrong.** `isOwnListing` treats `ownerId === 'u-seller-06'` (listing 1124, a featured NDA listing) as the signed-in user's own listing. A presenter who follows the demo script on 1124 as a guest goes through this sequence:
  1. Taps طلب تواصل.
  2. Signs in during the inquiry.
  3. Signs the NDA on their "own" listing.
  4. Returns to a detail page that now says إدارة الفرصة, with the data room still locked.
- **Why it matters.** The investor story contradicts itself mid-demo. The README doesn't say which card to tap.
- **Fix.** Either drop 1124 from the featured strip for the investor demo, or name the card in the README (704 and 932 are featured NDA listings owned by someone else). Or show the owner badge before sign-in.

**P1-2 · README: wrong Node version**
`apps/ios/README.md:15`
- **What's wrong.** It says "Node 20+". RN 0.88.1 declares `node ^22.13.0 || ^24.3.0 || >=26` and Expo 58 declares `^22.13.0 || …`.
- **Why it matters.** `npm install` or Metro fails or warns on Node 20, the most common LTS on Macs.
- **Fix.** Say "Node 22.13+ (or 24 LTS)".

**P1-3 · README Option B describes a build that doesn't exist and skips a step**
`apps/ios/README.md:33-40`
- **What's wrong.**
  - `npx expo run:ios --device` builds **Debug**. It needs Metro running and uses the dev reloader, not expo-updates as the README claims.
  - The only way to get a "real" build is `--configuration Release`, which hits P0-2.
  - The section doesn't mention that iOS 16+ needs **Settings → Privacy & Security → Developer Mode** turned on, or that CocoaPods/`prebuild` runs on first build.
- **Fix.** Document both variants (Debug with Metro, and `--configuration Release`). Add the Developer Mode step. Correct the reload note once P0-2 is fixed.

**P1-4 · US-IOS-05 (push notification stubs, MVP stub) is not implemented**
- **What's wrong.** There's no `expo-notifications`, no pre-permission explainer ("فعّل التنبيهات لتعرف فور وصول استفسار") after the first publish or inquiry, no local notification, and no deep link from a notification.
- **Why it matters.** It's an MVP story in the iOS epic, and the moment is easy to demo.
- **Fix.** Add the explainer sheet after the first `sendInquiry` or `publish`. Then call `requestPermissionsAsync`, schedule one local notification ("استفسار جديد") that deep-links to `/inbox`, and mark it تجريبي.

**P1-5 · Dynamic Type: fixed heights clip text; AX3 isn't reachable**
`apps/ios/src/components/Text.tsx:25`, `components/ui.tsx:206`, `components/Button.tsx:68`, `app/(tabs)/(discover)/index.tsx:276`, `app/consultants/[id].tsx:185`, `components/OtpInput.tsx:82`
- **What's wrong.**
  - Every `Text` caps at `maxFontSizeMultiplier={1.8}`, which is below AX3.
  - Chips are fixed at `height: 34` while subhead text at 1.8× has a ~36pt line height.
  - Buttons use a fixed `height: spec.height` with `numberOfLines={1}`.
  - The Discover service mini-cards are fixed at 170×132, the consultant day cells at 60×72, and the OTP boxes at 58×64.
- **Why it matters.** US-A11Y-04 (MVP) says layouts reflow at AX3 without truncating prices or CTAs. At large sizes, chip and button labels will clip and the mini-cards will overflow.
- **Fix.**
  - Use `minHeight` instead of `height` on Chip, Button (keep the 50/34/28 as minimums), mini-cards and day cells.
  - Allow 2 lines on large buttons.
  - Raise the cap to about 2.4 for body text, keeping lower caps only on the tab bar and the hero counter.
  - Verify with Settings → Accessibility → Larger Text.

**P1-6 · Service request sheet may not open after sign-in (confirm on device)**
`apps/ios/src/app/services/[id].tsx:146-149`, `apps/ios/src/lib/auth.ts:20`
- **What's wrong.** As a guest, "اطلب الخدمة" runs `requireAuth(() => setSheet(true))`. The pending action fires 350 ms after `router.back()` starts dismissing the native formSheet, and then presents an RN `<Modal presentationStyle="formSheet">`. If the dismissal is still animating, UIKit refuses the presentation ("already presenting") and nothing appears.
- **Why it matters.** US-SRV-03 and US-AUTH-01 say you return to the request sheet. It looks broken if it fails.
- **Fix.** Make `/services/request/[id]` an Expo Router formSheet route instead of an RN `Modal`. Or run pending actions in the auth screen's `beforeRemove`/`transitionEnd` listener rather than after a fixed 350 ms.

**P1-7 · VoiceOver never announces toasts or inline errors**
`apps/ios/src/components/ui.tsx:159`, `apps/ios/src/components/Field.tsx:47`
- **What's wrong.** `accessibilityLiveRegion` only works on Android. On iOS nothing is announced for "تم الحفظ", the booking confirmation (shown only as a toast), "تم إرسال الطلب", or the field validation errors.
- **Why it matters.** US-A11Y-04. A VoiceOver user gets no confirmation that a booking or service request went through.
- **Fix.** In `toast()` and wherever an error is set, call `AccessibilityInfo.announceForAccessibility(msg)`. For errors, also move focus with `AccessibilityInfo.setAccessibilityFocus`.

### P2: polish and partly met requirements

**Brand and tokens**

1. **Hard-coded hex and rgba instead of `@forsa/tokens`.** `theme/index.ts` says the tokens are "the only source of hex", but these files have literals:
   - `app/listing/new.tsx:25` (`PHOTO_TINTS`)
   - `app/(tabs)/profile/index.tsx:196-198, 206, 215-216` (row icon backgrounds)
   - `app/about.tsx:50-51`
   - `components/ValueHero.tsx:67-75, 113` (`#0F1838` and rgba versions of the brand blues)
   - `components/ui.tsx:19-22`
   - `components/Button.tsx:40`
   - `app/(tabs)/(discover)/index.tsx:236`
   - `app/(tabs)/inbox/index.tsx:251`
   - `app/inquiry/[id].tsx:238`

   Fix: add `success/warning/danger` tint tokens and a `navyDeep` token to `@forsa/tokens`, and import them.
2. **Navy row icon is nearly invisible in dark mode.** `#17234F` on the dark card at `app/(tabs)/profile/index.tsx:197`. Fix: use `c.navy` with a light variant, or `c.primary`.

**RTL, motion and haptics**

3. **Swipe action icon doesn't mirror.** `arrow.forward.circle.fill` at `app/(tabs)/inbox/index.tsx:318` isn't marked `directional`, so in RTL it points the wrong way. Also confirm on a device whether `ReanimatedSwipeable` puts "advance" on the leading (right) edge in RTL.
4. **Double haptic on many buttons.** `Button` always fires `light` (`components/Button.tsx:60`), so buttons that also fire `success` or `error` (Continue, Publish, Verify, Book) buzz twice. Fix: add a `haptics` prop to `Button` and turn it off when the handler fires its own notification haptic.
5. **Hero drift never stops.** The infinite `withRepeat` drift (`components/ValueHero.tsx:44`) isn't cancelled when Reduce Motion turns on mid-session, or while Discover is off-screen (tabs stay mounted). Fix: `cancelAnimation(drift)` in the effect cleanup and when `reduced`, and pause with `useIsFocused`.

**Crash risks and timers**

6. **Timers keep running after a sheet is dismissed.**
   - The OTP submit timer (`app/inquiry/[id].tsx:105`) still records a signed NDA if the sheet is swiped away during the 700 ms.
   - The mock owner auto-reply timer (`app/(tabs)/inbox/index.tsx:385`) isn't cleared.

   Fix: store the timer ids and clear them on unmount.
7. **Inquiry sheet is blank for an unknown id.** `app/inquiry/[id].tsx:58` returns `null`. Fix: show `EmptyState` with a close button.

**Inbox and inquiry status**

8. **Inbox badge shows for guests.** The tab bar shows the unread count "2" while signed out (`components/GlassTabBar.tsx:30`), and the Inbox then asks the guest to sign in. Fix: only show the badge when `session` exists.
9. **"عرض حالة طلبك" lands on the wrong segment.** It opens Profile on فرصي, not طلباتي (`app/opportunity/[id].tsx:144`). The button also doesn't show the status, which US-INQ-01 asks for. Fix: navigate with a `tab=requests` param, and add the status chip to the CTA bar.
10. **Pipeline actions are hard to reach with VoiceOver.** Long-press "نقل إلى…" and the swipe actions have no `accessibilityActions` (`app/(tabs)/inbox/index.tsx:137-149`); they are only reachable through the detail modal.

**Accessibility and layout**

11. **Card label missing "verified".** The card's accessibility label omits "موثّقة" (`components/OpportunityCard.tsx:47`), which US-A11Y-04's example includes.
12. **Segment labels truncate.**
    - Profile has 4 segments (`app/(tabs)/profile/index.tsx:90`); "خدماتي ومواعيدي" gets about 85pt.
    - Opportunities has 5 type segments (`app/(tabs)/opportunities/index.tsx:121`); "البحث عن شريك" and "مستثمر لفكرة" get about 74pt.

    Fix: shorter labels (e.g. "خدماتي", "شريك", "فكرة") or a scrolling chip row.
13. **Status bar over the detail hero.** `StatusBar style="auto"` (`app/_layout.tsx:55`) gives dark status-bar text on the darkened hero photo in light mode. Fix: set `style="light"` on the detail screen while the hero is visible.

**Copy and formatting**

14. **Arabic plurals.**
    - "6 فرصة" and "5 فرصة" (`app/(tabs)/(discover)/index.tsx:100`) should be "6 فرص" for 3–10.
    - "نُشرت قبل 148 يوم" (`app/opportunity/[id].tsx:224`) should be "يومًا".

    Fix: add a small Arabic plural helper.
15. **Dates show the Hijri calendar.** `ar-SA-u-nu-latn` gives Hijri (Umm al-Qura) dates for the NDA signature timestamp (`app/inquiry/[id].tsx:212`) and the document watermark (`components/DocViewer.tsx:25`). The consultants screen correctly adds `-ca-gregory`. Fix: add `-ca-gregory` everywhere, unless Hijri is intended.
16. **Consultant date strip.**
    - Slot keys use the UTC date (`toISOString().slice(0,10)`) but display the local `getDate()` (`app/consultants/[id].tsx:26-36`), so they disagree between 00:00 and 03:00 Riyadh time.
    - The strip has 7 days; US-CNS-03 asks for 14.
17. **`Intl` on Hermes.** `Intl.NumberFormat(..., { notation: 'compact' })` (`components/FilterSheet.tsx:64`, and possibly `formatSAR` in tokens) depends on Hermes iOS `Intl` support. Confirm on a device that labels don't fall back to raw numbers.

**Face ID and document viewer**

18. **Doc opens without auth when biometrics are "unavailable".** `lib/faceid.ts:22` and `app/opportunity/[id].tsx:132-134`: any exception or missing biometrics opens the document with only a toast. That's acceptable for a demo, but say so in the README. Also confirm on a device that the blur in `components/DocViewer.tsx:22` is applied before iOS takes the app-switcher snapshot. If not, cover the view synchronously on `inactive` with a native privacy screen.

**Spec gaps (MVP stories only partly met)**

19. **Auth (US-AUTH-01, 03, 04):**
    - Save search isn't gated by sign-in (AUTH-01 lists it as a gated action).
    - The role picker is single-select; the spec says "one or more" (AUTH-04).
    - Nafath isn't required to publish (AUTH-03).
20. **Listing wizard (US-LST-02, 04, 05):**
    - LST-02: Investment is missing expected payback; Partner is missing proposed split and commitment; Idea is missing the ask.
    - LST-04: photos can't be reordered.
    - LST-05: quality flags aren't shown at review.
    - Wizard data other than type, title, price, city and category isn't saved on publish.
21. **Inquiry form (US-INQ-02).** Investor type isn't prefilled from the profile.

**README and config**

22. **README and `app.json` details.**
    - `npm run ios` runs `expo start --ios`, which tries to open the iOS Simulator; it is not plain `expo start` (`README.md:19`, `package.json:8`). On a PC, or a Mac without Xcode, that errors or prompts. Suggest `npm start -w @forsa/ios` for Expo Go.
    - Option A should note that the App Store build of Expo Go only supports the latest SDK.
    - `app.json` sets the splash both at top level and in the plugin (harmless duplication).

---

## 4. What passed

**Screens and navigation**
- All of S01–S14 exist and can be reached:
  - Tabs: Discover · الفرص · (+) · الوارد · حسابي.
  - The + opens `listing/new` as a modal, and `(tabs)/add` redirects.
  - Detail opens from cards, the inquiry formSheet from the CTA.
  - Services, consultants, learn, articles, about and FAQ are reachable from Discover and Profile. Contact is in About.
- Deep-link params from Discover (`?type=`, `?city=`) are applied on Opportunities.

**Inquiry flow**
- The flow is wired: message → sign-in (only at "متابعة", input kept) → NDA summary and full text, switch, typed-name signature (≥ 2 words) → OTP → success with a success haptic.
- `sendInquiry` persists to the store (AsyncStorage). It appears in Inbox → المحادثات and Profile → طلباتي.
- The detail page then shows عرض حالة طلبك and بانتظار موافقة المالك, then "simulate approval", then the Face ID gate, then the watermarked viewer.
- Listings without an NDA skip straight to sending.

**Owner pipeline**
- Segments map to `InquiryStatus`, with counts. Swipe to advance or decline.
- Long-press "نقل إلى…" uses an action sheet. Templated decline reasons.
- تمت الصفقة asks for the deal value and shows the commission note. Grant access appears on `nda-signed`. The unread badge works.

**Add wizard**
- Starts without login, autosaves, and offers to resume.
- Type-specific fields; title rules (10–80 characters, not the type or city name).
- Live thousands separators and price in words; "did you mean ×1000" when the price is under 10,000.
- Equity and margin are validated; a preview card is shown.
- The 2.5% commission is disclosed with a single switch. Sign-in is asked only at انشر الفرصة.
- The new listing is added to `myListings`, Profile flies it in with `BOUNCY` (skipped under Reduce Motion), and it flips from قيد المراجعة to منشورة after about 3.5 s.

**Auth sheet**
- Appears only at the moment of action: inquiry continue, publish, service request, booking, and the sign-in CTAs on Inbox and Profile.
- The pending action is cleared if the sheet is swiped away.
- +966 validation accepts Arabic-Indic digits.
- OTP field has one-time-code autofill and a 60 s resend timer. Mock Nafath code and role chips.

**RTL**
- `allowRTL` plus `forceRTL` with a persisted one-shot guard (`rtlBootReloads`). It can't loop: the guard caps automatic reloads at one per mismatch, and resets once the direction matches.
- `Text` uses `textAlign: 'auto'` and `writingDirection: 'auto'`. Logical `start`/`end` and `paddingStart`/`paddingEnd` are used throughout.
- Chevrons use `chevron.forward` with `directional` mirroring. The OTP boxes and phone row are forced LTR. Step slide-in direction follows reading direction.

**HIG buttons**
- Variants: filled, tinted, gray, plain, destructive and destructiveTinted.
- Heights 28/34/50 from tokens; radius 12 on large; minimum 44pt hit targets via `hitSlop`.
- Press scale 0.97 with a spring, and a light haptic.
- Other targets checked (header circles 36 + 6 slop, save heart 44, rows, chips, tab items 52, swipe actions 96) are all at least 44pt.

**Haptics**
- Mapping matches US-IOS-02: selection for tabs, segments, filters and chips; light for save; success for NDA signed, published, booked and inquiry sent; error on validation.
- Every call is wrapped so it can't throw.

**Reduce Motion**
- Respected in the press scale, hero counter (final value right away), parallax, wizard and inquiry transitions (150 ms fades), and the publish fly-in.
- Reanimated 4's built-in animations default to the system setting.

**Accessibility labels and roles**
- Labels and roles on buttons, tabs (`selected` state), radios in the type step, metric tiles (one element each), and the hero counter (static label while the digits roll).
- Icon-only buttons are labelled (share, save search, send).

**`app.json`**
- `sa.forsh.app`; `supportsTablet: false`; `userInterfaceStyle: automatic` with `expo-system-ui`.
- Face ID usage description is set three ways: in `infoPlist`, in the plugin, and localized `NSFaceIDUsageDescription` in `locales/ar.json` and `locales/en.json`.
- `CFBundleDisplayName` is localized and the development region is `ar`. `ITSAppUsesNonExemptEncryption: false`. `supportsRTL` for builds and Expo Go.
- The icon is 1024² RGB with no alpha (still a placeholder).

**Monorepo and dependencies**
- `metro.config.js`: watching the workspace root, `nodeModulesPaths` app-first, and the `react` singleton pin (19.3.0 from the app, while the root hoists 19.3.1) are correct. The iOS export resolves cleanly.
- All dependency versions match SDK 58.

**Crash safety**
- Hooks run before early returns, and missing records are handled with `EmptyState`.
- Optional lookups use `?.`. iOS-only APIs (`ActionSheetIOS`, `Alert.prompt`) are fine for an iPhone-only app.
- Every native module used is in Expo Go.

**Memory and timers**
- `setInterval`/`setTimeout`, `AppState` listeners and Reanimated values are cleaned up, except the items in P2-5 and P2-6.

---

## 5. Device checklist for the presenter (after the fixes)

1. Fresh install in Expo Go on an English-language iPhone. Expect one automatic reload, then RTL, with the tab bar reading اكتشف on the right.
2. Discover: the hero counter rolls up; the featured strip renders with rounded cards (P0-1); tapping a card zooms into the detail page.
3. Inquiry on a featured NDA listing **other than 1124** (P1-1): sign in → NDA → OTP → success → simulate approval → Face ID → watermark. Background the app and check the app-switcher snapshot is blurred.
4. + → publish as the signed-in user. The card flies into فرصي and flips to منشورة.
5. Inbox: swipe in both directions, long-press, تمت الصفقة with a value.
6. Profile → English: the app reloads to LTR, chevrons flip. Switch back to Arabic.
7. Settings → Accessibility: Reduce Motion on, Larger Text at AX3, Bold Text, dark mode. Re-run steps 2–4.
8. If you demo a Release or TestFlight build: cold-launch on an English device and confirm the app gets past the splash (P0-2).

---

## Re-test (2026-11-03, after commits 14645ff … 46be1ba)

I re-ran the same checks as the first pass. I did not change any app code.

- **Build checks.**
  - `npx tsc --noEmit -p apps/ios`: **Pass**, 0 errors.
  - `npx expo export --platform ios`: **Pass**, 1,829 modules, 4.4 MB Hermes bundle.
  - `expo-notifications ~58.1.7` matches the SDK 58 bundled version and is in `package-lock.json`.
- **Web render.** I copied the current `apps/ios/src`, `app.json`, `package.json` and `packages/` into the scratchpad again and confirmed the copy was identical to the repo. All 11 routes I loaded rendered with no page errors:
  - `/` (Discover), `/opportunities`, `/opportunity/704` and `/opportunity/1124`. These were the three routes that crashed in the first pass.
  - `/inquiry/704`, `/inquiry/99999`, `/listing/new`, `/inbox`, `/profile`, `/auth`, `/consultants/1`.
  - The screenshots show:
    - rounded, styled cards;
    - one-word type segments (للبيع · استثمار · شريك · فكرة);
    - "نُشرت قبل 519 يومًا";
    - no inbox badge for guests;
    - Profile's fourth segment now reads "خدماتي";
    - the bad inquiry id now shows an empty state with a "تم" button.

### P0 and P1

| Item | Result | Notes |
|---|---|---|
| P0-1 Card style through `Link asChild` | **Pass** | `StyleSheet.flatten` at `OpportunityCard.tsx:50`. Confirmed in the web render. No other `asChild` children exist, and `Link.AppleZoomTarget` doesn't use `Slot`. |
| P0-2 Release reload and splash hang | **Pass** (code) | `reload.ts`: `DevSettings.reload()` only under `__DEV__`, otherwise `Updates.reloadAsync()` with no `isEnabled` guard (the native `DisabledAppController.requestRelaunch` recreates the React context). `_layout.tsx:41-44` hides the splash after 2.5 s regardless, and the 250 ms timer is now cleared on cleanup. **Confirm on a device** with a Release build on an English-language iPhone. |
| P1-1 Demo listing #1124 | **Pass** | Discover filters out the demo owner's listing and puts NDA listings first (`(discover)/index.tsx:25-29`). The README splits the demo into an investor path (#704/#932) and an owner path (#1124). |
| P1-2 Node version | **Pass** | README now says Node 22.13+ or 24 LTS. |
| P1-3 README Option B | **Pass** | Covers Developer Mode, Trust, CocoaPods/prebuild, B1 Debug (needs Metro) and B2 `--configuration Release`. The reload note matches the code. `npm start -w @forsa/ios` exists. |
| P1-4 US-IOS-05 notifications | **Pass** | `enableRemoteNotifications: false`, so the plugin adds no `aps-environment` entitlement and no background mode, and a free Apple ID can still sign the app. Local notifications work in Expo Go on iOS. The explainer shows after the first inquiry, never at launch, and asks for permission only on tap. Notifications are tagged "تجريبي" and deep-link into the app. See also new P2-N2 and P2-N3. |
| P1-5 Dynamic Type | **Pass**, with a regression (P2-N1) | `Text` caps at 2.4×. Chip, Button, mini-card, day cell, OTP box, busy slot, phone prefix and Segmented use `minHeight`. Large and medium buttons allow 2 lines. **Confirm at AX3 on a device.** |
| P1-6 Resume after auth sheet | **Pass** (code) | `auth.ts` keeps the pending action and a `ready` flag. The sheet runs the action on native-stack `transitionEnd` with `closing: true`, which fires on `onDisappear` after the dismissal finishes. Unmount after 600 ms is a fallback, and the second flush does nothing. Swiping the sheet away without signing in drops the action. **Confirm on a device:** services request Modal after sign-in, and inquiry → auth → NDA. |
| P1-7 VoiceOver announcements | **Pass** | `lib/a11y.ts` uses `announceForAccessibilityWithOptions(queue)` on iOS. Toasts and `ErrorText` are announced, and `Field` errors are announced through an effect. |

### P2

| # | Result | Notes |
|---|---|---|
| 1 Hex literals → tokens | **Pass** | Tints, glows, scrims and row colors now come from `theme` (derived from `@forsa/tokens`). What's left is `#FFFFFF` on colored fills and iOS systemGray in the theme, which is acceptable. |
| 2 Navy row icon in dark mode | **Pass** | Uses `rowIndigo` in dark mode. |
| 3 Swipe icon mirroring | **Pass** | The icon is `directional`. **Confirm the swipe edge in RTL on a device.** |
| 4 Double haptics | **Pass** | `Button` has a `haptics` prop, and it is turned off on Continue, Verify, Publish, Next, Book, Submit, Grant and Simulate. |
| 5 Hero drift | **Pass** | Uses `cancelAnimation` and pauses with `useIsFocused`. |
| 6 Timers after dismissal | **Pass** | The inquiry OTP timer and the thread auto-reply timer are both cleared. |
| 7 Unknown inquiry id | **Pass** | Shows an empty state with a close button (seen in the render). |
| 8 Badge for guests | **Pass** | |
| 9 Request status CTA | **Pass** | Opens `tab=requests`, and the CTA bar shows a status badge. |
| 10 VoiceOver pipeline actions | **Pass** | `accessibilityActions` for advance, move and decline. |
| 11 "Verified" in card label | **Pass** | |
| 12 Segment truncation | **Pass** | |
| 13 Status bar over hero | **Pass** | Light while over the hero, auto after scrolling past it. |
| 14 Arabic plurals | **Pass** | `countNoun` handles 1, 2, 3–10 and 11+. |
| 15 Gregorian dates | **Pass** | `dateLocale` is used everywhere. |
| 16 Consultant dates | **Pass** | Uses a local date key over a 14-day window (Fri/Sat excluded). |
| 17 `Intl` on Hermes | **Open** (device only) | |
| 18 Face ID fallback and switcher blur | **Partial** | The fallback is now documented in the README. The blur in the app switcher still needs a device check. |
| 19 Auth spec gaps | **Partial** | Save search is now gated and roles are multi-select (5 roles, with a store migration from v1). Nafath is still not required to publish (US-AUTH-03). |
| 20 Wizard spec gaps | **Pass** | Payback, split/commitment and ask fields. Long-press and VoiceOver reorder. Quality flags. Details are saved on publish. |
| 21 Investor-type prefill | **Pass** | |
| 22 README and `app.json` | **Pass** | `npm start` documented, Expo Go note added, duplicate splash config removed. |

### New defects (all P2)

- **P2-N1 · Buttons and chips no longer match the HIG sizes**
  - **Where:** `components/Button.tsx:70-71`, `components/ui.tsx:210`.
  - **What's wrong:** `minHeight` plus a fixed `paddingVertical` (3 or 6) plus a line height of `spec.lineHeight + 4` makes buttons taller than the spec at default text size. Measured in the render: small is 30 (spec 28), medium 38 (spec 34). Chips are 36 (spec 34) because Arabic subhead has a 24pt line height plus 12 of padding.
  - **Fix:** use `paddingVertical: Math.max(0, (spec.height - textLineHeight) / 2)`, or no vertical padding with `minHeight`. That keeps 28/34/50 at default size and still lets them grow.
- **P2-N2 · The last tapped notification reopens after every in-app reload**
  - **Where:** `lib/notify.ts:62-64`.
  - **What's wrong:** `getLastNotificationResponseAsync()` runs on every root mount. The native module keeps the last response for the life of the process, so after a reload (the language switch) the app pushes the old deep link again.
  - **Fix:** call `Notifications.clearLastNotificationResponse()` after handling it, or remember the handled notification's identifier.
- **P2-N3 · Possible warning banner in Expo Go**
  - **What's wrong:** importing `expo-notifications` in Expo Go logs `console.warn('expo-notifications functionality is not fully supported in Expo Go…')`.
  - **Fix:** if a LogBox banner shows during the demo, add `LogBox.ignoreLogs(['expo-notifications'])` in dev. Confirm on a device.
- **P2-N4 · Secondary and tertiary text are now nearly the same color**
  - **Where:** `packages/tokens/src/index.ts:45-46,79-80`.
  - **What's wrong:** `labelSecondary` and `labelTertiary` are now opaque greys only about 1 contrast step apart (#5E6272 and #6B6E79). The secondary/tertiary hierarchy is mostly gone, and the placeholder color is nearly as dark as body-secondary text. The change also affects `apps/web`.
  - **Fix:** this is acceptable for AA. If the hierarchy matters, make tertiary lighter and keep it only for non-essential text.

### Re-test verdict

**Pitch-ready for the Expo Go path (README Option A) and for a Release build (B2), subject to the device checks below.** No P0 or P1 defects remain open or are new. There are 4 new P2s. P2-17 is still open, and P2-18 and P2-19 are partly fixed.

What still needs a real iPhone:
- The Release cold launch on an English-language device (P0-2).
- The auth-sheet resume into the services Modal (P1-6).
- AX3 text size (P1-5).
- The local notification arriving and its deep link in Expo Go.
- The swipe edge in RTL.
- The blur in the app switcher.
- `Intl` output on Hermes.
